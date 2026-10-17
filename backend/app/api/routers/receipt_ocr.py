import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from starlette.concurrency import run_in_threadpool

from app.api.dependencies import get_current_user, get_receipt_ocr_service
from app.models.member import Member
from app.schemas.receipt_ocr import (
    OCRLineResponse,
    ReceiptCandidateResponse,
    ReceiptOCRResponse,
)
from app.services.receipt_ocr_service import (
    MAX_RECEIPT_BYTES,
    LocalOCRUnavailable,
    ReceiptImageError,
    ReceiptOCRService,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/receipt-ocr", tags=["Receipt OCR"])


@router.post(
    "/scan",
    response_model=ReceiptOCRResponse,
    status_code=status.HTTP_200_OK,
    summary="Recognize a receipt locally",
    description=(
        "Processes a validated PNG, JPEG, or WEBP receipt with the local "
        "pretrained PaddleOCR English and Devanagari recognizers. No expense or "
        "attachment is created by this request."
    ),
)
async def scan_receipt(
    file: UploadFile = File(...),  # noqa: B008
    _current_user: Member = Depends(get_current_user),  # noqa: B008
    service: ReceiptOCRService = Depends(get_receipt_ocr_service),  # noqa: B008
) -> ReceiptOCRResponse:
    # Read at most the existing 10 MB attachment limit plus one sentinel byte.
    image_bytes = await file.read(MAX_RECEIPT_BYTES + 1)
    try:
        result = await run_in_threadpool(
            service.process,
            image_bytes,
            file.filename or "receipt",
            file.content_type,
        )
    except ReceiptImageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except LocalOCRUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.warning("Receipt OCR request failed (%s).", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Receipt OCR could not be completed.",
        ) from exc

    return ReceiptOCRResponse(
        recognized_text=result.recognized_text,
        lines=[OCRLineResponse(text=line.text, confidence=line.confidence) for line in result.lines],
        candidate_fields=ReceiptCandidateResponse(**result.candidate_fields.as_dict()),
        warnings=list(result.warnings),
        ocr_engine=result.engine,
        model_version=result.model_version,
    )
