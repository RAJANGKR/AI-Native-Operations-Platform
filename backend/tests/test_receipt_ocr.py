import io
from datetime import date
from decimal import Decimal
from types import SimpleNamespace

import httpx
import pytest
from PIL import Image

from app.api.dependencies import get_current_user, get_receipt_ocr_service
from app.main import app
from app.services.receipt_extraction import extract_receipt_fields
from app.services.receipt_ocr_service import (
    LocalOCRUnavailable,
    OCRLine,
    ReceiptImageError,
    ReceiptOCRService,
)


def png_bytes(color=(255, 255, 255)):
    buffer = io.BytesIO()
    Image.new("RGB", (100, 120), color).save(buffer, format="PNG")
    return buffer.getvalue()


def image_bytes(image_format):
    buffer = io.BytesIO()
    Image.new("RGB", (100, 120), "white").save(buffer, format=image_format)
    return buffer.getvalue()


def test_financial_extraction_prefers_labeled_grand_total_and_ignores_subtotal_tax():
    fields = extract_receipt_fields(
        "ACME CAFE\nDate: 2026-10-17\nSubtotal ₹1,000.00\nGST ₹180.00\nGrand Total ₹1,180.00"
    )
    assert fields.merchant == "ACME CAFE"
    assert fields.expense_date == date(2026, 10, 17)
    assert fields.amount == Decimal("1180.00")
    assert fields.currency == "INR"
    assert fields.amount_confidence == "candidate"


def test_financial_extraction_marks_conflicting_labeled_totals_ambiguous():
    fields = extract_receipt_fields("TOTAL 150.00\nGRAND TOTAL 140.00\nGRAND TOTAL 145.00")
    assert fields.amount is None
    assert fields.amount_confidence == "ambiguous"
    assert fields.warnings


def test_financial_extraction_supports_devanagari_digits_and_total_label():
    fields = extract_receipt_fields("दुकान\nकुल राशि ₹१,२३४.५०\n१७/१०/२०२६")
    assert fields.amount == Decimal("1234.50")
    assert fields.expense_date == date(2026, 10, 17)


def test_financial_extraction_supports_comma_decimal_and_indian_grouping():
    fields = extract_receipt_fields("Total 1,23,456.78")
    assert fields.amount == Decimal("123456.78")
    comma_decimal = extract_receipt_fields("Total 1234,50")
    assert comma_decimal.amount == Decimal("1234.50")
    rupee_prefix = extract_receipt_fields("Total Rs. 50.00")
    assert rupee_prefix.amount == Decimal("50.00")
    assert rupee_prefix.currency == "INR"


def test_financial_extraction_supports_two_digit_receipt_years():
    fields = extract_receipt_fields("Date: 10/10/26")
    assert fields.expense_date == date(2026, 10, 10)

    multiple_dates = extract_receipt_fields("Invoice Date: unreadable\nOrder Date: 10/10/26")
    assert multiple_dates.expense_date == date(2026, 10, 10)
    assert any("Several receipt dates" in warning for warning in multiple_dates.warnings)


def test_total_amount_in_adjacent_ocr_column_is_grouped_by_visual_row():
    service = ReceiptOCRService()
    lines = (
        OCRLine("G.TOTAL", 99, top=100, left=10),
        OCRLine("4050", 98, top=108, left=100),
    )
    row_text = service._group_lines_by_row(lines, image_height=120)
    fields = extract_receipt_fields("G.TOTAL\n4050", amount_context_lines=row_text)
    assert fields.amount == Decimal("4050")
    assert fields.amount_confidence == "candidate"


@pytest.mark.parametrize("text", ["SHOP\nSubtotal 250\nTax 20", "SHOP\nPaid 260", "SHOP\nTotal ₹0"])
def test_financial_extraction_does_not_invent_unlabeled_or_zero_amount(text):
    fields = extract_receipt_fields(text)
    assert fields.amount is None
    assert fields.amount_confidence == "missing"


def test_valid_image_is_decoded_and_ocr_output_is_extracted():
    service = ReceiptOCRService()
    prediction = [SimpleNamespace(json={"res": {
            "rec_texts": ["ACME CAFE", "Date: 2026-10-17", "GRAND TOTAL ₹250.00"],
            "rec_scores": [0.99, 0.95, 0.97],
            "rec_boxes": [[0, 0, 100, 15], [0, 20, 100, 35], [0, 40, 100, 55]],
        }})]
    service._pipelines = {
        "hi": SimpleNamespace(predict=lambda _image: prediction),
        "en": SimpleNamespace(predict=lambda _image: prediction),
    }
    result = service.process(png_bytes(), "receipt.png", "image/png")
    assert "GRAND TOTAL ₹250.00" in result.recognized_text
    assert result.lines[0].confidence == pytest.approx(99)
    assert result.candidate_fields.amount == Decimal("250.00")
    assert result.engine == "PaddleOCR / ONNX Runtime"


@pytest.mark.parametrize(
    "image_format,filename,mime",
    [("JPEG", "receipt.jpg", "image/jpeg"), ("WEBP", "receipt.webp", "image/webp")],
)
def test_supported_jpeg_and_webp_images_decode(image_format, filename, mime):
    decoded = ReceiptOCRService.validate_image(image_bytes(image_format), filename, mime)
    assert decoded.mode == "RGB"


def test_blank_image_returns_manual_entry_warning():
    service = ReceiptOCRService()
    prediction = [SimpleNamespace(json={"res": {"rec_texts": [], "rec_scores": []}})]
    service._pipelines = {
        "hi": SimpleNamespace(predict=lambda _image: prediction),
        "en": SimpleNamespace(predict=lambda _image: prediction),
    }
    result = service.process(png_bytes(), "blank.png", "image/png")
    assert result.recognized_text == ""
    assert any("No readable text" in warning for warning in result.warnings)


@pytest.mark.parametrize(
    "content,filename,mime",
    [
        (b"not an image", "receipt.png", "image/png"),
        (b"%PDF-1.4", "receipt.pdf", "application/pdf"),
        (png_bytes(), "receipt.jpg", "image/jpeg"),
        (png_bytes(), "receipt.png", "image/jpeg"),
        (b"", "receipt.png", "image/png"),
    ],
)
def test_invalid_receipt_uploads_are_rejected(content, filename, mime):
    with pytest.raises(ReceiptImageError):
        ReceiptOCRService.validate_image(content, filename, mime)


def test_oversized_receipt_is_rejected_before_image_decode():
    with pytest.raises(ReceiptImageError, match="10 MB"):
        ReceiptOCRService.validate_image(b"0" * (10 * 1024 * 1024 + 1), "receipt.png", "image/png")


def test_model_initialization_failure_is_client_safe(monkeypatch):
    service = ReceiptOCRService()
    def unavailable(_language):
        raise LocalOCRUnavailable("No local model")
    monkeypatch.setattr(service, "_get_pipeline", unavailable)
    with pytest.raises(LocalOCRUnavailable, match="No local model"):
        service.process(png_bytes(), "receipt.png", "image/png")


def test_inference_failure_is_client_safe():
    service = ReceiptOCRService()
    service._pipelines = {
        "hi": SimpleNamespace(predict=lambda _image: (_ for _ in ()).throw(RuntimeError("private details"))),
        "en": SimpleNamespace(predict=lambda _image: []),
    }
    with pytest.raises(LocalOCRUnavailable, match="Try a clearer image"):
        service.process(png_bytes(), "receipt.png", "image/png")


def test_script_router_prefers_devanagari_recognizer_for_devanagari_text():
    merged = ReceiptOCRService._merge_script_results(
        (SimpleNamespace(text="कुल ₹250", confidence=87, top=100, left=20),),
        (SimpleNamespace(text="sH? ₹250", confidence=92, top=101, left=21),),
        500,
    )
    assert merged[0].text == "कुल ₹250"


@pytest.mark.asyncio
async def test_receipt_ocr_endpoint_requires_authentication():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/receipt-ocr/scan",
            files={"file": ("receipt.png", png_bytes(), "image/png")},
        )
    assert response.status_code == 401


def test_receipt_ocr_endpoint_is_registered():
    assert "/api/v1/receipt-ocr/scan" in app.openapi()["paths"]


@pytest.mark.asyncio
async def test_receipt_ocr_endpoint_returns_contract_for_authenticated_user():
    service = ReceiptOCRService()
    prediction = [SimpleNamespace(json={"res": {
        "rec_texts": ["SHOP", "TOTAL 125.00"],
        "rec_scores": [0.97, 0.94],
        "rec_boxes": [[0, 0, 40, 12], [0, 20, 70, 32]],
    }})]
    service._pipelines = {
        "hi": SimpleNamespace(predict=lambda _image: prediction),
        "en": SimpleNamespace(predict=lambda _image: prediction),
    }
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace()
    app.dependency_overrides[get_receipt_ocr_service] = lambda: service
    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/receipt-ocr/scan",
                files={"file": ("receipt.png", png_bytes(), "image/png")},
            )
        assert response.status_code == 200
        body = response.json()
        assert body["recognized_text"] == "SHOP\nTOTAL 125.00"
        assert body["candidate_fields"]["amount"] == "125.00"
        assert body["ocr_engine"] == "PaddleOCR / ONNX Runtime"
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_receipt_ocr_service, None)
