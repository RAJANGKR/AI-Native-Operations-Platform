from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_attachment_service,
    translate_service_exception,
)
from app.schemas.attachment import (
    AttachmentCreate,
    AttachmentResponse,
    AttachmentUpdate,
)
from app.schemas.common import MessageResponse
from app.services.attachment_service import AttachmentService

router = APIRouter(prefix="/attachments", tags=["Attachments"])


@router.post(
    "/",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create attachment",
    description="Create a new attachment resource.",
)
async def create_attachment(
    payload: AttachmentCreate,
    service: AttachmentService = Depends(get_attachment_service),
) -> AttachmentResponse:
    try:
        attachment = await service.create_attachment(**payload.model_dump())
        return AttachmentResponse.model_validate(attachment)
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/{attachment_id}",
    response_model=AttachmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get attachment",
    description="Fetch a single attachment by its identifier.",
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


@router.patch(
    "/{attachment_id}",
    response_model=AttachmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Update attachment",
    description="Partially update an attachment by its identifier.",
)
async def update_attachment(
    attachment_id: UUID,
    payload: AttachmentUpdate,
    service: AttachmentService = Depends(get_attachment_service),
) -> AttachmentResponse:
    try:
        attachment = await service.update_attachment(
            attachment_id,
            **payload.model_dump(exclude_unset=True),
        )
        return AttachmentResponse.model_validate(attachment)
    except Exception as exc:
        translate_service_exception(exc)


@router.delete(
    "/{attachment_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete attachment",
    description="Delete an attachment by its identifier.",
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
