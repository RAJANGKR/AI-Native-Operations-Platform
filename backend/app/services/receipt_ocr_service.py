"""Local PaddleOCR adapter and bounded receipt-image validation."""

from __future__ import annotations

import io
import logging
import os
import re
import threading
from dataclasses import dataclass
from importlib.metadata import PackageNotFoundError, version

from PIL import Image, UnidentifiedImageError

from app.services.receipt_extraction import CandidateFields, extract_receipt_fields

logger = logging.getLogger(__name__)

MAX_RECEIPT_BYTES = 10 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
SUPPORTED_IMAGE_FORMATS = {"PNG", "JPEG", "WEBP"}
FORMAT_MIME_TYPES = {"PNG": "image/png", "JPEG": "image/jpeg", "WEBP": "image/webp"}


class ReceiptImageError(ValueError):
    """The uploaded file is not a supported, safe receipt image."""


class LocalOCRUnavailable(RuntimeError):
    """PaddleOCR, ONNX Runtime, or local model weights are unavailable."""


@dataclass(frozen=True)
class OCRLine:
    text: str
    confidence: float | None
    top: float = 0.0
    left: float = 0.0


@dataclass(frozen=True)
class OCRResult:
    recognized_text: str
    lines: tuple[OCRLine, ...]
    candidate_fields: CandidateFields
    warnings: tuple[str, ...]
    engine: str
    model_version: str


def _box_origin(box) -> tuple[float, float]:
    values: list[float] = []

    def collect_numbers(value) -> None:
        if isinstance(value, (list, tuple)):
            for part in value:
                collect_numbers(part)
        else:
            try:
                values.append(float(value))
            except (TypeError, ValueError):
                return

    collect_numbers(box)
    if len(values) < 4:
        return 0.0, 0.0
    return min(values[1::2]), min(values[0::2])


class ReceiptOCRService:
    """Cached English and Devanagari recognizers using local ONNX inference."""

    def __init__(self) -> None:
        self._pipelines = {}
        self._model_lock = threading.Lock()

    @staticmethod
    def validate_image(image_bytes: bytes, filename: str, content_type: str | None) -> Image.Image:
        if not image_bytes:
            raise ReceiptImageError("The uploaded image is empty.")
        if len(image_bytes) > MAX_RECEIPT_BYTES:
            raise ReceiptImageError("Receipt image exceeds the 10 MB limit.")
        try:
            with Image.open(io.BytesIO(image_bytes)) as probe:
                image_format = (probe.format or "").upper()
                width, height = probe.size
                if image_format not in SUPPORTED_IMAGE_FORMATS:
                    raise ReceiptImageError("Unsupported image format. Use PNG, JPG, or WEBP.")
                if width < 1 or height < 1 or width * height > MAX_IMAGE_PIXELS:
                    raise ReceiptImageError("Image dimensions are invalid or exceed the 20 megapixel limit.")
                probe.verify()
            extension = os.path.splitext(filename.lower())[1]
            expected_extensions = {"PNG": {".png"}, "JPEG": {".jpg", ".jpeg"}, "WEBP": {".webp"}}
            if extension and extension not in expected_extensions[image_format]:
                raise ReceiptImageError("The filename extension does not match the image contents.")
            if content_type and content_type.lower() != FORMAT_MIME_TYPES[image_format]:
                raise ReceiptImageError("The declared content type does not match the image contents.")
            with Image.open(io.BytesIO(image_bytes)) as decoded:
                return decoded.convert("RGB")
        except ReceiptImageError:
            raise
        except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
            raise ReceiptImageError("The uploaded file is not a valid, readable image.") from exc

    def _get_pipeline(self, language: str):
        if language in self._pipelines:
            return self._pipelines[language]
        with self._model_lock:
            if language not in self._pipelines:
                try:
                    from paddleocr import PaddleOCR

                    self._pipelines[language] = PaddleOCR(
                        lang=language,
                        use_doc_orientation_classify=False,
                        use_doc_unwarping=False,
                        use_textline_orientation=False,
                        engine="onnxruntime",
                    )
                except Exception as exc:
                    logger.warning("Local PaddleOCR initialization failed (%s).", type(exc).__name__)
                    raise LocalOCRUnavailable(
                        "Local PaddleOCR is unavailable. Install the OCR extra and make the pretrained model weights available."
                    ) from exc
        return self._pipelines[language]

    @staticmethod
    def _extract_lines(predictions) -> tuple[OCRLine, ...]:
        lines: list[OCRLine] = []
        for page in predictions or []:
            raw = getattr(page, "json", None)
            if callable(raw):
                raw = raw()
            if raw is None and isinstance(page, dict):
                raw = page
            if not isinstance(raw, dict):
                continue
            result = raw.get("res", raw)
            texts = result.get("rec_texts", []) if isinstance(result, dict) else []
            scores = result.get("rec_scores", []) if isinstance(result, dict) else []
            boxes = result.get("rec_boxes", result.get("rec_polys", [])) if isinstance(result, dict) else []
            entries = []
            for index, text in enumerate(texts):
                text = str(text).strip()
                if not text:
                    continue
                try:
                    score = float(scores[index])
                    confidence = max(0.0, min(100.0, score * 100 if score <= 1 else score))
                except (IndexError, TypeError, ValueError):
                    confidence = None
                box = boxes[index] if len(boxes) > index else None
                top = left = 0.0
                top, left = _box_origin(box)
                entries.append((top, left, OCRLine(text, confidence, top, left)))
            lines.extend(item[2] for item in sorted(entries, key=lambda item: (item[0], item[1])))
        return tuple(lines)

    @staticmethod
    def _merge_script_results(
        devanagari: tuple[OCRLine, ...], english: tuple[OCRLine, ...], image_height: int
    ) -> tuple[OCRLine, ...]:
        """Select the recognizer output best suited to each detected text line."""
        merged: list[OCRLine] = []
        remaining_dev = list(devanagari)
        y_tolerance = max(12.0, image_height * 0.025)
        for eng in english:
            match = min(
                remaining_dev,
                key=lambda item: abs(item.top - eng.top) + abs(item.left - eng.left) * 0.15,
                default=None,
            )
            if match is not None and abs(match.top - eng.top) <= y_tolerance:
                remaining_dev.remove(match)
                merged.append(match if re.search(r"[\u0900-\u097F]", match.text) else eng)
            else:
                merged.append(eng)
        merged.extend(line for line in remaining_dev if re.search(r"[\u0900-\u097F]", line.text))
        return tuple(sorted(merged, key=lambda line: (line.top, line.left)))

    def process(self, image_bytes: bytes, filename: str, content_type: str | None) -> OCRResult:
        image = self.validate_image(image_bytes, filename, content_type)
        try:
            import numpy as np

            image_array = np.asarray(image)
            devanagari = self._extract_lines(self._get_pipeline("hi").predict(image_array))
            english = self._extract_lines(self._get_pipeline("en").predict(image_array))
            lines = self._merge_script_results(devanagari, english, image.height)
        except LocalOCRUnavailable:
            raise
        except Exception as exc:
            logger.warning("Local PaddleOCR inference failed (%s).", type(exc).__name__)
            raise LocalOCRUnavailable("Local OCR could not process this image. Try a clearer image.") from exc

        recognized_text = "\n".join(line.text for line in lines)
        candidates = extract_receipt_fields(recognized_text)
        warnings = list(candidates.warnings)
        if not recognized_text:
            warnings.insert(0, "No readable text was recognized. You can enter the values manually.")
        try:
            model_version = (
                f"PP-OCRv6 English + PP-OCRv5 Devanagari; "
                f"PaddleOCR {version('paddleocr')}; ONNX Runtime {version('onnxruntime')}"
            )
        except PackageNotFoundError:
            model_version = "PP-OCRv6 English + PP-OCRv5 Devanagari"
        return OCRResult(recognized_text, lines, candidates, tuple(warnings), "PaddleOCR / ONNX Runtime", model_version)


receipt_ocr_service = ReceiptOCRService()
