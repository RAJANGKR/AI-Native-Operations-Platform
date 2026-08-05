from uuid import UUID

from pydantic import Field

from app.enums.attachment import AttachmentType, OCRStatus
from app.schemas.common import (
    APIModel,
    DescriptionStr,
    MimeTypeStr,
    PathStr,
    TimestampedResponse,
)


class AttachmentCreate(APIModel):
    """Schema for creating an attachment."""

    expense_id: UUID = Field(description="Expense identifier")
    type: AttachmentType = Field(description="Attachment category")
    storage_path: PathStr
    mime_type: MimeTypeStr
    ocr_status: OCRStatus = Field(
        default=OCRStatus.PENDING,
        description="Current OCR processing status",
    )
    ocr_text: DescriptionStr | None = Field(
        default=None,
        description="OCR-extracted text, if available",
        examples=["Taxi receipt from airport transfer"],
    )


class AttachmentUpdate(APIModel):
    """Schema for updating an attachment."""

    expense_id: UUID | None = Field(default=None, description="Expense identifier")
    type: AttachmentType | None = Field(default=None, description="Attachment category")
    storage_path: PathStr | None = None
    mime_type: MimeTypeStr | None = None
    ocr_status: OCRStatus | None = Field(
        default=None,
        description="Current OCR processing status",
    )
    ocr_text: DescriptionStr | None = Field(
        default=None,
        description="OCR-extracted text, if available",
    )


class AttachmentSummaryResponse(TimestampedResponse):
    """Lightweight attachment schema for nested responses."""

    expense_id: UUID = Field(description="Expense identifier")
    type: AttachmentType = Field(description="Attachment category")
    storage_path: str = Field(description="Storage path for the uploaded asset")
    mime_type: str = Field(description="MIME type for the uploaded asset")
    ocr_status: OCRStatus = Field(description="Current OCR processing status")


class AttachmentResponse(AttachmentSummaryResponse):
    """Schema returned for attachment resources."""

    ocr_text: str | None = Field(
        default=None,
        description="OCR-extracted text, if available",
    )
