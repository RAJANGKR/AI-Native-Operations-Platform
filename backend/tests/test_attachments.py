import io
import uuid
import pytest
from PIL import Image
from fastapi import HTTPException, UploadFile
from unittest.mock import AsyncMock, MagicMock, patch

from app.enums.attachment import AttachmentType, OCRStatus
from app.core.storage import StorageOperationError, SupabaseStorageClient
from app.api.dependencies import translate_service_exception
from app.main import app
from app.models.attachment import Attachment
from app.services.attachment_service import (
    AttachmentService,
    ALLOWED_EXTENSIONS,
    REJECTED_EXTENSIONS,
    MAX_FILE_SIZE_BYTES,
)


def _valid_image_bytes(image_format: str) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (2, 2), color="white").save(buffer, format=image_format)
    return buffer.getvalue()


def _valid_pdf_bytes() -> bytes:
    return b"%PDF-1.4\n1 0 obj <<>> endobj\n%%EOF\n"


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
    organization_id = uuid.uuid4()
    mock_expense = MagicMock()
    mock_expense.id = expense_id
    mock_expense.report_id = uuid.uuid4()

    mock_report = MagicMock()
    mock_report.organization_id = organization_id

    service.expense_repository.get_by_id = AsyncMock(return_value=mock_expense)
    service.expense_report_repository.get_by_id = AsyncMock(return_value=mock_report)

    file_content = b"fake binary data"
    upload_file = UploadFile(
        filename="malicious.exe",
        file=io.BytesIO(file_content),
        headers={"content-type": "application/x-msdownload"},
    )

    with pytest.raises(ValueError, match="Invalid file type"):
        await service.upload_attachment(expense_id, upload_file, organization_id)


@pytest.mark.asyncio
async def test_upload_attachment_size_exceeded():
    """Verify error when file exceeds 10 MB limit."""
    mock_session = AsyncMock()
    service = AttachmentService(mock_session)

    expense_id = uuid.uuid4()
    organization_id = uuid.uuid4()
    mock_expense = MagicMock()
    mock_expense.id = expense_id
    mock_expense.report_id = uuid.uuid4()

    mock_report = MagicMock()
    mock_report.organization_id = organization_id

    service.expense_repository.get_by_id = AsyncMock(return_value=mock_expense)
    service.expense_report_repository.get_by_id = AsyncMock(return_value=mock_report)

    # The service must reject after reading only the size limit plus one byte.
    large_bytes = b"0" * (11 * 1024 * 1024)
    file_buffer = io.BytesIO(large_bytes)
    upload_file = UploadFile(
        filename="large_receipt.pdf",
        file=file_buffer,
        headers={"content-type": "application/pdf"},
    )

    with pytest.raises(ValueError, match="10 MB limit"):
        await service.upload_attachment(expense_id, upload_file, organization_id)
    assert file_buffer.tell() == MAX_FILE_SIZE_BYTES + 1


@pytest.mark.asyncio
async def test_upload_attachment_rejects_mismatched_extension_and_mime():
    service = AttachmentService(AsyncMock())
    expense_id = uuid.uuid4()
    organization_id = uuid.uuid4()
    service.expense_repository.get_by_id = AsyncMock(return_value=MagicMock(report_id=uuid.uuid4()))
    service.expense_report_repository.get_by_id = AsyncMock(
        return_value=MagicMock(organization_id=organization_id)
    )
    upload_file = UploadFile(
        filename="receipt.png",
        file=io.BytesIO(_valid_image_bytes("PNG")),
        headers={"content-type": "image/jpeg"},
    )
    with pytest.raises(ValueError, match="does not match declared MIME"):
        await service.upload_attachment(expense_id, upload_file, organization_id)


@pytest.mark.asyncio
async def test_upload_attachment_rejects_corrupt_image_without_storage_or_record():
    service = AttachmentService(AsyncMock())
    expense_id = uuid.uuid4()
    organization_id = uuid.uuid4()
    service.expense_repository.get_by_id = AsyncMock(return_value=MagicMock(report_id=uuid.uuid4()))
    service.expense_report_repository.get_by_id = AsyncMock(
        return_value=MagicMock(organization_id=organization_id)
    )
    service.attachment_repository.create = AsyncMock()
    upload_file = UploadFile(
        filename="broken.png",
        file=io.BytesIO(b"\x89PNG\r\n\x1a\ntruncated"),
        headers={"content-type": "image/png"},
    )
    with patch("app.services.attachment_service.storage_client.upload_file", new_callable=AsyncMock) as upload:
        with pytest.raises(ValueError, match="invalid or corrupt"):
            await service.upload_attachment(expense_id, upload_file, organization_id)
    upload.assert_not_awaited()
    service.attachment_repository.create.assert_not_awaited()


@pytest.mark.asyncio
async def test_upload_attachment_rejects_content_that_disagrees_with_extension():
    service = AttachmentService(AsyncMock())
    expense_id = uuid.uuid4()
    organization_id = uuid.uuid4()
    service.expense_repository.get_by_id = AsyncMock(return_value=MagicMock(report_id=uuid.uuid4()))
    service.expense_report_repository.get_by_id = AsyncMock(
        return_value=MagicMock(organization_id=organization_id)
    )
    upload_file = UploadFile(
        filename="receipt.jpg",
        file=io.BytesIO(_valid_image_bytes("PNG")),
        headers={"content-type": "image/jpeg"},
    )
    with patch("app.services.attachment_service.storage_client.upload_file", new_callable=AsyncMock) as upload:
        with pytest.raises(ValueError, match="does not match the '.*' extension"):
            await service.upload_attachment(expense_id, upload_file, organization_id)
    upload.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("filename", "content_type", "content"),
    [
        ("receipt.pdf", "application/pdf", _valid_pdf_bytes()),
        ("receipt.png", "image/png", _valid_image_bytes("PNG")),
        ("receipt.jpg", "image/jpeg", _valid_image_bytes("JPEG")),
        ("receipt.webp", "image/webp", _valid_image_bytes("WEBP")),
        (
            "receipt.heic",
            "image/heic",
            b"\x00\x00\x00\x10ftypheic\x00\x00\x00\x00"
            b"\x00\x00\x00\x0cmeta\x00\x00\x00\x00",
        ),
    ],
)
async def test_upload_attachment_accepts_supported_valid_formats(filename, content_type, content):
    service = AttachmentService(AsyncMock())
    expense_id = uuid.uuid4()
    report_id = uuid.uuid4()
    organization_id = uuid.uuid4()
    service.expense_repository.get_by_id = AsyncMock(return_value=MagicMock(report_id=report_id))
    service.expense_report_repository.get_by_id = AsyncMock(
        return_value=MagicMock(
            id=report_id,
            organization_id=organization_id,
            chapter_id=uuid.uuid4(),
            event_id=None,
        )
    )
    service.attachment_repository.create = AsyncMock(return_value=MagicMock())
    async def mock_tx(fn):
        return await fn()
    service._run_in_transaction = mock_tx
    upload_file = UploadFile(
        filename=filename,
        file=io.BytesIO(content),
        headers={"content-type": content_type},
    )
    with patch("app.services.attachment_service.storage_client.upload_file", new_callable=AsyncMock) as upload:
        await service.upload_attachment(expense_id, upload_file, organization_id)
    upload.assert_awaited_once()
    service.attachment_repository.create.assert_awaited_once()


@pytest.mark.asyncio
async def test_member_cannot_upload_receipt_to_another_members_expense():
    service = AttachmentService(AsyncMock())
    expense_id = uuid.uuid4()
    uploader_id = uuid.uuid4()
    organization_id = uuid.uuid4()
    report_id = uuid.uuid4()
    service.expense_repository.get_by_id = AsyncMock(return_value=MagicMock(report_id=report_id))
    service.expense_report_repository.get_by_id = AsyncMock(
        return_value=MagicMock(organization_id=organization_id, member_id=uuid.uuid4())
    )
    upload = UploadFile(
        filename="receipt.png",
        file=io.BytesIO(b"image data"),
        headers={"content-type": "image/png"},
    )

    with pytest.raises(ValueError, match="Expense not found"):
        await service.upload_attachment(
            expense_id,
            upload,
            organization_id,
            uploaded_by=uploader_id,
            member_id=uploader_id,
        )


@pytest.mark.asyncio
async def test_member_cannot_read_another_members_attachment():
    service = AttachmentService(AsyncMock())
    attachment = MagicMock(expense_id=uuid.uuid4())
    service.attachment_repository.get_by_id = AsyncMock(return_value=attachment)
    service.expense_repository.get_by_id = AsyncMock(return_value=MagicMock(report_id=uuid.uuid4()))
    service.expense_report_repository.get_by_id = AsyncMock(
        return_value=MagicMock(organization_id=uuid.uuid4(), member_id=uuid.uuid4())
    )

    result = await service.get_attachment(
        uuid.uuid4(),
        organization_id=None,
        member_id=uuid.uuid4(),
    )

    assert result is None


@pytest.mark.asyncio
async def test_member_cannot_get_download_url_for_another_members_attachment():
    service = AttachmentService(AsyncMock())
    service.get_attachment = AsyncMock(return_value=None)
    with patch(
        "app.services.attachment_service.storage_client.create_signed_url",
        new_callable=AsyncMock,
    ) as signed_url:
        with pytest.raises(ValueError, match="Attachment not found"):
            await service.download_attachment(uuid.uuid4(), None, uuid.uuid4())
    signed_url.assert_not_awaited()


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
        file_bytes = _valid_pdf_bytes()
        upload_file = UploadFile(
            filename="receipt.pdf",
            file=io.BytesIO(file_bytes),
            headers={"content-type": "application/pdf"},
        )

        res = await service.upload_attachment(expense_id, upload_file, mock_report.organization_id)
        assert res is not None
        assert res.original_filename == "receipt.pdf"
        mock_upload.assert_called_once()


def _service_for_upload(expense_id, report_id, organization_id):
    service = AttachmentService(AsyncMock())
    service.expense_repository.get_by_id = AsyncMock(return_value=MagicMock(report_id=report_id))
    service.expense_report_repository.get_by_id = AsyncMock(
        return_value=MagicMock(
            id=report_id,
            organization_id=organization_id,
            chapter_id=uuid.uuid4(),
            event_id=None,
        )
    )
    service.attachment_repository.create = AsyncMock(return_value=MagicMock())
    async def mock_tx(fn):
        return await fn()
    service._run_in_transaction = mock_tx
    return service


@pytest.mark.asyncio
async def test_storage_upload_fails_when_client_unavailable():
    client = SupabaseStorageClient()
    with patch.object(client, "_get_client", return_value=None):
        with pytest.raises(StorageOperationError, match="unavailable"):
            await client.upload_file("org/report/expense/file.pdf", b"data", "application/pdf")


@pytest.mark.asyncio
async def test_storage_upload_exception_is_sanitized():
    client = SupabaseStorageClient()
    bucket = MagicMock()
    bucket.upload.side_effect = RuntimeError("sensitive provider detail")
    supabase = MagicMock()
    supabase.storage.from_.return_value = bucket
    with patch.object(client, "_get_client", return_value=supabase):
        with pytest.raises(StorageOperationError, match="upload failed") as exc:
            await client.upload_file("org/report/expense/file.pdf", b"data", "application/pdf")
    assert "sensitive" not in str(exc.value)


@pytest.mark.asyncio
async def test_storage_signed_url_never_falls_back_to_localhost():
    client = SupabaseStorageClient()
    with patch.object(client, "_get_client", return_value=None):
        with pytest.raises(StorageOperationError, match="unavailable") as exc:
            await client.create_signed_url("org/report/expense/file.pdf")
    assert "localhost" not in str(exc.value)


@pytest.mark.asyncio
async def test_storage_signed_url_provider_failure_is_sanitized():
    client = SupabaseStorageClient()
    bucket = MagicMock()
    bucket.create_signed_url.side_effect = RuntimeError("sensitive provider detail")
    supabase = MagicMock()
    supabase.storage.from_.return_value = bucket
    with patch.object(client, "_get_client", return_value=supabase):
        with pytest.raises(StorageOperationError, match="download is unavailable") as exc:
            await client.create_signed_url("org/report/expense/file.pdf")
    assert "sensitive" not in str(exc.value)


@pytest.mark.asyncio
async def test_storage_delete_exception_is_sanitized():
    client = SupabaseStorageClient()
    bucket = MagicMock()
    bucket.remove.side_effect = RuntimeError("sensitive provider detail")
    supabase = MagicMock()
    supabase.storage.from_.return_value = bucket
    with patch.object(client, "_get_client", return_value=supabase):
        with pytest.raises(StorageOperationError, match="deletion failed") as exc:
            await client.delete_file("org/report/expense/file.pdf")
    assert "sensitive" not in str(exc.value)


@pytest.mark.asyncio
async def test_upload_storage_failure_does_not_create_attachment_metadata():
    expense_id, report_id, organization_id = uuid.uuid4(), uuid.uuid4(), uuid.uuid4()
    service = _service_for_upload(expense_id, report_id, organization_id)
    file = UploadFile(
        filename="receipt.pdf",
        file=io.BytesIO(_valid_pdf_bytes()),
        headers={"content-type": "application/pdf"},
    )
    with patch(
        "app.services.attachment_service.storage_client.upload_file",
        new_callable=AsyncMock,
        side_effect=StorageOperationError("Attachment storage upload failed."),
    ):
        with pytest.raises(StorageOperationError):
            await service.upload_attachment(expense_id, file, organization_id)
    service.attachment_repository.create.assert_not_awaited()


@pytest.mark.asyncio
async def test_metadata_insert_failure_cleans_up_uploaded_object():
    expense_id, report_id, organization_id = uuid.uuid4(), uuid.uuid4(), uuid.uuid4()
    service = _service_for_upload(expense_id, report_id, organization_id)
    service.attachment_repository.create.side_effect = RuntimeError("database insert failed")
    file = UploadFile(
        filename="receipt.pdf",
        file=io.BytesIO(_valid_pdf_bytes()),
        headers={"content-type": "application/pdf"},
    )
    with patch("app.services.attachment_service.storage_client.upload_file", new_callable=AsyncMock), patch(
        "app.services.attachment_service.storage_client.delete_file", new_callable=AsyncMock
    ) as cleanup:
        with pytest.raises(RuntimeError, match="database insert failed"):
            await service.upload_attachment(expense_id, file, organization_id)
    cleanup.assert_awaited_once()


@pytest.mark.asyncio
async def test_attachment_delete_storage_failure_keeps_metadata_and_surfaces_error():
    service = AttachmentService(AsyncMock())
    attachment = MagicMock(id=uuid.uuid4(), expense_id=uuid.uuid4(), storage_path="private/path.pdf")
    service.get_attachment = AsyncMock(return_value=attachment)
    service.attachment_repository.delete = AsyncMock()
    with patch(
        "app.services.attachment_service.storage_client.delete_file",
        new_callable=AsyncMock,
        side_effect=StorageOperationError("Attachment storage deletion failed."),
    ):
        with pytest.raises(StorageOperationError):
            await service.delete_attachment(attachment.id, uuid.uuid4())
    service.attachment_repository.delete.assert_not_awaited()


def test_storage_operation_error_maps_to_sanitized_service_unavailable():
    with pytest.raises(HTTPException) as exc:
        translate_service_exception(StorageOperationError("Attachment storage is unavailable."))
    assert exc.value.status_code == 503
    assert exc.value.detail == "Attachment storage is unavailable."
