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
    type: AttachmentType = Field(default=AttachmentType.RECEIPT, description="Attachment category")
    storage_path: PathStr
    original_filename: str | None = Field(default=None, description="Original filename")
    mime_type: MimeTypeStr
    size_bytes: int = Field(default=0, description="File size in bytes")
    uploaded_by: UUID | None = Field(default=None, description="Uploader user identifier")
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
    original_filename: str | None = None
    mime_type: MimeTypeStr | None = None
    size_bytes: int | None = None
    uploaded_by: UUID | None = None
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
    original_filename: str | None = Field(default=None, description="Original filename")
    mime_type: str = Field(description="MIME type for the uploaded asset")
    size_bytes: int = Field(default=0, description="File size in bytes")
    uploaded_by: UUID | None = Field(default=None, description="Uploader user identifier")
    ocr_status: OCRStatus = Field(description="Current OCR processing status")


class AttachmentResponse(AttachmentSummaryResponse):
    """Schema returned for attachment resources."""

    ocr_text: str | None = Field(
        default=None,
        description="OCR-extracted text, if available",
    )


class DownloadUrlResponse(APIModel):
    """Schema for returning signed download URL."""

    download_url: str = Field(description="Temporary signed download URL")
    expires_in: int = Field(default=300, description="Expiration time in seconds")
