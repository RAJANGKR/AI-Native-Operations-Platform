import hashlib
import logging
import os
import uuid
from typing import Any

from fastapi import UploadFile

from app.core.storage import storage_client
from app.enums.attachment import AttachmentType, OCRStatus
from app.models.attachment import Attachment
from app.repositories.attachment_repository import AttachmentRepository
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.expense_report_repository import ExpenseReportRepository
from app.services.base import BaseService

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".heic"}
REJECTED_EXTENSIONS = {".zip", ".rar", ".exe", ".js", ".bat", ".dll"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/heic",
    "image/heif",
}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


class AttachmentService(BaseService):
    """Service layer for attachment use cases."""

    def __init__(self, session: Any) -> None:
        super().__init__(session)
        self.attachment_repository = AttachmentRepository(session)
        self.expense_repository = ExpenseRepository(session)
        self.expense_report_repository = ExpenseReportRepository(session)

    async def upload_attachment(
        self,
        expense_id: uuid.UUID,
        file: UploadFile,
        uploaded_by: uuid.UUID | None = None,
    ) -> Attachment:
        """Validate, upload to Supabase Storage, and persist metadata in DB."""
        expense = await self.expense_repository.get_by_id(expense_id)
        if expense is None:
            raise ValueError("Expense not found")

        original_filename = file.filename or "receipt.pdf"
        _, ext = os.path.splitext(original_filename)
        ext = ext.lower()
        if not ext:
            ext = ".pdf"

        if ext in REJECTED_EXTENSIONS or ext not in ALLOWED_EXTENSIONS:
            raise ValueError(
                f"Invalid file type '{ext}'. Allowed extensions: PDF, PNG, JPG, JPEG, HEIC."
            )

        content_type = file.content_type or "application/octet-stream"
        if content_type.lower() not in ALLOWED_MIME_TYPES and ext not in ALLOWED_EXTENSIONS:
            raise ValueError(
                f"Invalid file type '{content_type}'. Allowed MIME types: PDF, PNG, JPG, JPEG, HEIC."
            )

        file_bytes = await file.read()
        size_bytes = len(file_bytes)

        if size_bytes > MAX_FILE_SIZE_BYTES:
            raise ValueError("File size exceeds 10 MB limit.")

        sha256_hash = hashlib.sha256(file_bytes).hexdigest()

        # Resolve hierarchy IDs
        report_id = expense.report_id
        report = await self.expense_report_repository.get_by_id(report_id)

        org_id = getattr(report, "organization_id", uuid.UUID("00000000-0000-0000-0000-000000000001"))
        chap_id = getattr(report, "chapter_id", uuid.UUID("00000000-0000-0000-0000-000000000003"))
        evt_id = getattr(report, "event_id", None) or uuid.UUID("00000000-0000-0000-0000-000000000004")

        attachment_uuid = uuid.uuid4()
        storage_path = f"{org_id}/{chap_id}/{evt_id}/{report_id}/{expense_id}/{attachment_uuid}{ext}"

        # Upload to Supabase Storage
        try:
            await storage_client.upload_file(storage_path, file_bytes, content_type)
        except Exception as exc:
            logger.error(f"Supabase Storage upload failed: {exc}")
            raise ValueError(f"Failed to upload attachment file to storage: {exc}")

        # Save metadata to DB with orphan cleanup safety
        try:
            return await self._run_in_transaction(
                lambda: self.attachment_repository.create(
                    id=attachment_uuid,
                    expense_id=expense_id,
                    type=AttachmentType.RECEIPT,
                    storage_path=storage_path,
                    original_filename=original_filename,
                    mime_type=content_type,
                    size_bytes=size_bytes,
                    sha256_hash=sha256_hash,
                    uploaded_by=uploaded_by,
                    ocr_status=OCRStatus.PENDING,
                )
            )
        except Exception as db_err:
            logger.error(f"Database insertion failed after upload. Deleting orphan storage file: {db_err}")
            try:
                await storage_client.delete_file(storage_path)
            except Exception as cleanup_err:
                logger.error(f"Failed to delete orphan file from storage: {cleanup_err}")
            raise db_err

    async def get_attachment(self, attachment_id: uuid.UUID) -> Attachment | None:
        """Return an attachment by id."""
        return await self.attachment_repository.get_by_id(attachment_id)

    async def download_attachment(self, attachment_id: uuid.UUID) -> str:
        """Generate a 5-minute signed download URL for an attachment."""
        attachment = await self.attachment_repository.get_by_id(attachment_id)
        if attachment is None:
            raise ValueError("Attachment not found")

        return await storage_client.create_signed_url(
            attachment.storage_path, expires_in=300
        )

    async def delete_attachment(self, attachment_id: uuid.UUID) -> None:
        """Delete file from Supabase storage AND PostgreSQL DB."""
        attachment = await self.attachment_repository.get_by_id(attachment_id)
        if attachment is None:
            raise ValueError("Attachment not found")

        # Delete from Supabase Storage first
        try:
            await storage_client.delete_file(attachment.storage_path)
        except Exception as storage_err:
            logger.error(f"Storage deletion failed for attachment {attachment_id}: {storage_err}")
            raise ValueError(f"Storage deletion failed: {storage_err}")

        # Delete from DB
        await self._run_in_transaction(
            lambda: self.attachment_repository.delete(attachment)
        )

    async def get_attachments_for_expense(
        self, expense_id: uuid.UUID
    ) -> list[Attachment]:
        """Return all attachments for an expense."""
        return await self.attachment_repository.get_by_expense(expense_id)

    async def list_attachments(
        self, expense_id: uuid.UUID
    ) -> list[Attachment]:
        """Alias for get_attachments_for_expense."""
        return await self.get_attachments_for_expense(expense_id)

