import hashlib
import io
import logging
import os
import uuid
from typing import Any

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from app.core.storage import StorageOperationError, storage_client
from app.enums.attachment import AttachmentType, OCRStatus
from app.enums.expense_report import ExpenseReportStatus
from app.models.attachment import Attachment
from app.repositories.attachment_repository import AttachmentRepository
from app.repositories.expense_report_repository import ExpenseReportRepository
from app.repositories.expense_repository import ExpenseRepository
from app.services.base import BaseService

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".heic"}
REJECTED_EXTENSIONS = {".zip", ".rar", ".exe", ".js", ".bat", ".dll"}
EXTENSION_MIME_TYPES = {
    ".pdf": {"application/pdf"},
    ".png": {"image/png"},
    ".jpg": {"image/jpeg", "image/jpg"},
    ".jpeg": {"image/jpeg", "image/jpg"},
    ".webp": {"image/webp"},
    ".heic": {"image/heic", "image/heif"},
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
        organization_id: uuid.UUID | None,
        uploaded_by: uuid.UUID | None = None,
        member_id: uuid.UUID | None = None,
    ) -> Attachment:
        """Validate, upload to Supabase Storage, and persist metadata in DB."""
        expense = await self.expense_repository.get_by_id(expense_id)
        if expense is None:
            raise ValueError("Expense not found")

        report = await self.expense_report_repository.get_by_id(expense.report_id)
        if report is None:
            raise ValueError("Expense not found")
        if organization_id is not None and report.organization_id != organization_id:
            raise ValueError("Expense not found")
        if member_id is not None and report.member_id != member_id:
            raise ValueError("Expense not found")
        if member_id is not None and report.status != ExpenseReportStatus.DRAFT:
            raise RuntimeError("Members can only attach files to draft expense reports")

        original_filename = file.filename or "receipt.pdf"
        _, ext = os.path.splitext(original_filename)
        ext = ext.lower()
        if not ext:
            ext = ".pdf"

        if ext in REJECTED_EXTENSIONS or ext not in ALLOWED_EXTENSIONS:
            raise ValueError(
                f"Invalid file type '{ext}'. Allowed extensions: PDF, PNG, JPG, JPEG, WEBP, HEIC."
            )

        content_type = (file.content_type or "").lower().strip()
        if content_type not in EXTENSION_MIME_TYPES[ext]:
            raise ValueError(
                f"File extension '{ext}' does not match declared MIME type '{content_type or 'missing'}'."
            )

        # Read at most the limit plus one sentinel byte so oversized uploads
        # cannot be buffered in full before rejection.
        file_bytes = await file.read(MAX_FILE_SIZE_BYTES + 1)
        size_bytes = len(file_bytes)

        if size_bytes > MAX_FILE_SIZE_BYTES:
            raise ValueError("File size exceeds 10 MB limit.")
        if not file_bytes:
            raise ValueError("Uploaded file is empty.")

        self._validate_file_content(ext, file_bytes)

        sha256_hash = hashlib.sha256(file_bytes).hexdigest()

        # A timeout can hide a successful upload response from the client.
        # Return its existing row on a sequential retry instead of creating a
        # second attachment for the same receipt and expense.
        existing_attachment = await self.attachment_repository.get_by_expense_and_sha256(
            expense_id, sha256_hash
        )
        if existing_attachment is not None:
            return existing_attachment

        report_id = expense.report_id
        evt_id = report.event_id or "no-event"

        attachment_uuid = uuid.uuid4()
        storage_path = (
            f"{report.organization_id}/{report.chapter_id}/{evt_id}/"
            f"{report_id}/{expense_id}/{sha256_hash}{ext}"
        )

        # Upload to Supabase Storage
        try:
            await storage_client.upload_file(storage_path, file_bytes, content_type)
        except Exception as exc:
            logger.error("Attachment storage upload failed (%s).", type(exc).__name__)
            if isinstance(exc, StorageOperationError):
                raise
            raise StorageOperationError("Attachment storage upload failed.") from exc

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
            logger.error("Attachment metadata insert failed; attempting storage cleanup (%s).", type(db_err).__name__)
            try:
                await storage_client.delete_file(storage_path)
            except Exception as cleanup_err:
                logger.error("Orphan attachment cleanup failed (%s).", type(cleanup_err).__name__)
            raise db_err

    async def get_attachment(
        self,
        attachment_id: uuid.UUID,
        organization_id: uuid.UUID | None,
        member_id: uuid.UUID | None = None,
    ) -> Attachment | None:
        """Return an attachment by id, scoped to the caller's organization."""
        attachment = await self.attachment_repository.get_by_id(attachment_id)
        if attachment is None:
            return None
        if organization_id is not None and not await self._belongs_to_organization(
            attachment, organization_id
        ):
            return None
        if member_id is not None and not await self._belongs_to_member(attachment, member_id):
            return None
        return attachment

    async def download_attachment(
        self,
        attachment_id: uuid.UUID,
        organization_id: uuid.UUID | None,
        member_id: uuid.UUID | None = None,
    ) -> str:
        """Generate a 5-minute signed download URL for an attachment."""
        attachment = await self.get_attachment(attachment_id, organization_id, member_id)
        if attachment is None:
            raise ValueError("Attachment not found")

        return await storage_client.create_signed_url(
            attachment.storage_path, expires_in=300
        )

    async def delete_attachment(
        self,
        attachment_id: uuid.UUID,
        organization_id: uuid.UUID | None,
        member_id: uuid.UUID | None = None,
    ) -> None:
        """Delete file from Supabase storage AND PostgreSQL DB."""
        attachment = await self.get_attachment(attachment_id, organization_id, member_id)
        if attachment is None:
            raise ValueError("Attachment not found")

        if member_id is not None:
            expense = await self.expense_repository.get_by_id(attachment.expense_id)
            report = await self.expense_report_repository.get_by_id(expense.report_id) if expense else None
            if report is None or report.member_id != member_id:
                raise ValueError("Attachment not found")
            if report.status != ExpenseReportStatus.DRAFT:
                raise RuntimeError("Members can only delete files from draft expense reports")

        # Delete from Supabase Storage first
        try:
            await storage_client.delete_file(attachment.storage_path)
        except Exception as storage_err:
            logger.error("Storage deletion failed for attachment (%s).", type(storage_err).__name__)
            if isinstance(storage_err, StorageOperationError):
                raise
            raise StorageOperationError("Attachment storage deletion failed.") from storage_err

        # Delete from DB
        await self._run_in_transaction(
            lambda: self.attachment_repository.delete(attachment)
        )

    async def get_attachments_for_expense(
        self,
        expense_id: uuid.UUID,
        organization_id: uuid.UUID | None,
        member_id: uuid.UUID | None = None,
    ) -> list[Attachment]:
        """Return all attachments for an expense in the caller's organization."""
        expense = await self.expense_repository.get_by_id(expense_id)
        if expense is None:
            raise ValueError("Expense not found")
        report = await self.expense_report_repository.get_by_id(expense.report_id)
        if report is None:
            raise ValueError("Expense not found")
        if organization_id is not None and report.organization_id != organization_id:
            raise ValueError("Expense not found")
        if member_id is not None and report.member_id != member_id:
            raise ValueError("Expense not found")

        return await self.attachment_repository.get_by_expense(expense_id)

    @staticmethod
    def _validate_file_content(ext: str, file_bytes: bytes) -> None:
        """Reject files whose bytes do not match their allowed extension."""
        if ext == ".pdf":
            if not file_bytes.startswith(b"%PDF-") or b"%%EOF" not in file_bytes[-1024:]:
                raise ValueError("Uploaded PDF is invalid or corrupt.")
            return

        if ext == ".heic":
            # HEIC/HEIF is not supported by the bundled Pillow codecs. Check
            # the ISO-BMFF file type, a recognized HEIF brand, and a bounded
            # top-level metadata box instead.
            brands = {b"heic", b"heix", b"hevc", b"hevx", b"mif1", b"msf1"}
            ftyp_size = int.from_bytes(file_bytes[:4], "big") if len(file_bytes) >= 4 else 0
            if (
                ftyp_size < 16
                or ftyp_size > len(file_bytes)
                or file_bytes[4:8] != b"ftyp"
                or file_bytes[8:12] not in brands
                or (ftyp_size - 16) % 4 != 0
            ):
                raise ValueError("Uploaded HEIC image is invalid or corrupt.")
            offset = ftyp_size
            has_meta_box = False
            while offset + 8 <= len(file_bytes):
                box_size = int.from_bytes(file_bytes[offset : offset + 4], "big")
                box_type = file_bytes[offset + 4 : offset + 8]
                header_size = 8
                if box_size == 1:
                    if offset + 16 > len(file_bytes):
                        break
                    box_size = int.from_bytes(file_bytes[offset + 8 : offset + 16], "big")
                    header_size = 16
                elif box_size == 0:
                    box_size = len(file_bytes) - offset
                if box_size < header_size or offset + box_size > len(file_bytes):
                    break
                if box_type == b"meta" and box_size >= 12:
                    has_meta_box = True
                offset += box_size
            if not has_meta_box:
                raise ValueError("Uploaded HEIC image is invalid or corrupt.")
            return

        expected_format = {
            ".png": "PNG",
            ".jpg": "JPEG",
            ".jpeg": "JPEG",
            ".webp": "WEBP",
        }[ext]
        try:
            with Image.open(io.BytesIO(file_bytes)) as image:
                if image.format != expected_format:
                    raise ValueError(
                        f"File content does not match the '{ext}' extension."
                    )
                image.verify()
        except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
            raise ValueError("Uploaded image is invalid or corrupt.") from exc

    async def _belongs_to_organization(
        self, attachment: Attachment, organization_id: uuid.UUID
    ) -> bool:
        expense = await self.expense_repository.get_by_id(attachment.expense_id)
        if expense is None:
            return False
        report = await self.expense_report_repository.get_by_id(expense.report_id)
        return report is not None and report.organization_id == organization_id

    async def _belongs_to_member(
        self, attachment: Attachment, member_id: uuid.UUID
    ) -> bool:
        expense = await self.expense_repository.get_by_id(attachment.expense_id)
        if expense is None:
            return False
        report = await self.expense_report_repository.get_by_id(expense.report_id)
        return report is not None and report.member_id == member_id

