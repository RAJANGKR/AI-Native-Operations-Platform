from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile, status

from app.api.dependencies import (
    get_attachment_service,
    translate_service_exception,
)
from app.schemas.attachment import (
    AttachmentResponse,
    DownloadUrlResponse,
)
from app.schemas.common import MessageResponse
from app.services.attachment_service import AttachmentService

router = APIRouter(prefix="/attachments", tags=["Attachments"])


@router.post(
    "/upload",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload receipt attachment",
    description="Upload a receipt file to Supabase Storage and record metadata in DB.",
)
async def upload_attachment(
    expense_id: UUID = Form(...),
    file: UploadFile = File(...),
    service: AttachmentService = Depends(get_attachment_service),
) -> AttachmentResponse:
    try:
        attachment = await service.upload_attachment(expense_id=expense_id, file=file)
        return AttachmentResponse.model_validate(attachment)
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/{attachment_id}",
    response_model=AttachmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get attachment metadata",
    description="Fetch a single attachment metadata by its identifier.",
)
async def get_attachment(
    attachment_id: UUID,
    service: AttachmentService = Depends(get_attachment_service),
) -> AttachmentResponse:
    try:
        attachment = await service.get_attachment(attachment_id)
        if attachment is None:
            raise ValueError("Attachment not found")
        return AttachmentResponse.model_validate(attachment)
    except Exception as exc:
        translate_service_exception(exc)


@router.delete(
    "/{attachment_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete attachment",
    description="Delete an attachment from Supabase storage and PostgreSQL.",
)
async def delete_attachment(
    attachment_id: UUID,
    service: AttachmentService = Depends(get_attachment_service),
) -> MessageResponse:
    try:
        await service.delete_attachment(attachment_id)
        return MessageResponse(message="Attachment deleted successfully")
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/{attachment_id}/download",
    response_model=DownloadUrlResponse,
    status_code=status.HTTP_200_OK,
    summary="Download attachment",
    description="Generate a temporary 5-minute signed URL for downloading the attachment.",
)
async def download_attachment(
    attachment_id: UUID,
    service: AttachmentService = Depends(get_attachment_service),
) -> DownloadUrlResponse:
    try:
        signed_url = await service.download_attachment(attachment_id)
        return DownloadUrlResponse(download_url=signed_url, expires_in=300)
    except Exception as exc:
        translate_service_exception(exc)
