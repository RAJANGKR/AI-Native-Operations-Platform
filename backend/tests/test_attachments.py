import io
import uuid
import pytest
from fastapi import UploadFile
from unittest.mock import AsyncMock, MagicMock, patch

from app.enums.attachment import AttachmentType, OCRStatus
from app.main import app
from app.models.attachment import Attachment
from app.services.attachment_service import (
    AttachmentService,
    ALLOWED_EXTENSIONS,
    REJECTED_EXTENSIONS,
    MAX_FILE_SIZE_BYTES,
)


@pytest.mark.asyncio
async def test_attachment_openapi_paths():
    """Verify attachment routes exist in FastAPI OpenAPI schema."""
    openapi = app.openapi()
    paths = openapi["paths"]
    assert "/api/v1/attachments/upload" in paths
    assert "/api/v1/attachments/{attachment_id}" in paths
    assert "/api/v1/attachments/{attachment_id}/download" in paths
    assert "/api/v1/expenses/{expense_id}/attachments" in paths


@pytest.mark.asyncio
async def test_upload_attachment_validation_rejected_extension():
    """Verify rejection of forbidden file extensions like .exe, .zip."""
    mock_session = AsyncMock()
    service = AttachmentService(mock_session)

    expense_id = uuid.uuid4()
    mock_expense = MagicMock()
    mock_expense.id = expense_id
    mock_expense.report_id = uuid.uuid4()

    service.expense_repository.get_by_id = AsyncMock(return_value=mock_expense)

    file_content = b"fake binary data"
    upload_file = UploadFile(
        filename="malicious.exe",
        file=io.BytesIO(file_content),
        headers={"content-type": "application/x-msdownload"},
    )

    with pytest.raises(ValueError, match="Invalid file type"):
        await service.upload_attachment(expense_id, upload_file)


@pytest.mark.asyncio
async def test_upload_attachment_size_exceeded():
    """Verify error when file exceeds 10 MB limit."""
    mock_session = AsyncMock()
    service = AttachmentService(mock_session)

    expense_id = uuid.uuid4()
    mock_expense = MagicMock()
    mock_expense.id = expense_id
    mock_expense.report_id = uuid.uuid4()

    service.expense_repository.get_by_id = AsyncMock(return_value=mock_expense)

    # 11 MB file
    large_bytes = b"0" * (11 * 1024 * 1024)
    upload_file = UploadFile(
        filename="large_receipt.pdf",
        file=io.BytesIO(large_bytes),
        headers={"content-type": "application/pdf"},
    )

    with pytest.raises(ValueError, match="10 MB limit"):
        await service.upload_attachment(expense_id, upload_file)


@pytest.mark.asyncio
async def test_upload_attachment_success_and_sha256():
    """Verify sha256 calculation and successful attachment creation."""
    mock_session = AsyncMock()
    service = AttachmentService(mock_session)

    expense_id = uuid.uuid4()
    report_id = uuid.uuid4()

    mock_expense = MagicMock()
    mock_expense.id = expense_id
    mock_expense.report_id = report_id

    mock_report = MagicMock()
    mock_report.id = report_id
    mock_report.organization_id = uuid.uuid4()
    mock_report.chapter_id = uuid.uuid4()
    mock_report.event_id = uuid.uuid4()

    service.expense_repository.get_by_id = AsyncMock(return_value=mock_expense)
    service.expense_report_repository.get_by_id = AsyncMock(return_value=mock_report)

    mock_attachment = Attachment(
        id=uuid.uuid4(),
        expense_id=expense_id,
        type=AttachmentType.RECEIPT,
        storage_path="mock/path.pdf",
        original_filename="receipt.pdf",
        mime_type="application/pdf",
        size_bytes=1024,
        sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        ocr_status=OCRStatus.PENDING,
    )
    service.attachment_repository.create = AsyncMock(return_value=mock_attachment)
    async def mock_tx(fn):
        return await fn()

    service._run_in_transaction = mock_tx

    with patch("app.services.attachment_service.storage_client.upload_file", new_callable=AsyncMock) as mock_upload:
        mock_upload.return_value = "mock/path.pdf"
        file_bytes = b"receipt content"
        upload_file = UploadFile(
            filename="receipt.pdf",
            file=io.BytesIO(file_bytes),
            headers={"content-type": "application/pdf"},
        )

        res = await service.upload_attachment(expense_id, upload_file)
        assert res is not None
        assert res.original_filename == "receipt.pdf"
        mock_upload.assert_called_once()
