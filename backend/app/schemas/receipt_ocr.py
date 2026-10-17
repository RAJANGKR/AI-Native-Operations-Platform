from datetime import date
from decimal import Decimal

from pydantic import Field

from app.schemas.common import APIModel


class OCRLineResponse(APIModel):
    text: str
    confidence: float | None = Field(default=None, ge=0, le=100)


class ReceiptCandidateResponse(APIModel):
    merchant: str | None = None
    expense_date: date | None = None
    amount: Decimal | None = None
    currency: str | None = None
    amount_confidence: str = "missing"


class ReceiptOCRResponse(APIModel):
    recognized_text: str
    lines: list[OCRLineResponse]
    candidate_fields: ReceiptCandidateResponse
    warnings: list[str]
    ocr_engine: str
    model_version: str
