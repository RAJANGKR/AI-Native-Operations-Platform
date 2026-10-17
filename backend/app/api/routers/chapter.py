import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_chapter_service,
    get_scope_organization_id,
    require_admin,
    require_treasurer,
    translate_service_exception,
)
from app.enums.role import Role
from app.models.member import Member
from app.schemas.chapter import ChapterCreate, ChapterResponse, ChapterUpdate
from app.schemas.common import MessageResponse
from app.services.chapter_service import ChapterService

router = APIRouter(prefix="/chapters", tags=["Chapters"])


@router.get(
    "/",
    response_model=list[ChapterResponse],
    status_code=status.HTTP_200_OK,
    summary="List all chapters",
    description="Return all chapters in the caller's organization.",
)
async def get_chapters(
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: ChapterService = Depends(get_chapter_service),
) -> list[ChapterResponse]:
    try:
        chapters = await service.get_all_chapters(scope_organization_id)
        return [ChapterResponse.model_validate(chapter) for chapter in chapters]
    except Exception as exc:
        return translate_service_exception(exc)


@router.post(
    "/",
    response_model=ChapterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create chapter",
    description="Create a new chapter resource. Superadmins may target any "
    "organization; every other role is confined to their own organization.",
)
async def create_chapter(
    payload: ChapterCreate,
    service: ChapterService = Depends(get_chapter_service),
    current_user: Member = Depends(require_treasurer),
) -> ChapterResponse:
    try:
        data = payload.model_dump()
        if current_user.role != Role.SUPERADMIN:
            data["organization_id"] = current_user.organization_id
        chapter = await service.create_chapter(**data)
        return ChapterResponse.model_validate(chapter)
    except Exception as exc:
        return translate_service_exception(exc)


@router.get(
    "/organization/{organization_id}",
    response_model=list[ChapterResponse],
    status_code=status.HTTP_200_OK,
    summary="List chapters by organization",
    description="Return all chapters belonging to an organization.",
)
async def get_chapters_by_organization(
    organization_id: UUID,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: ChapterService = Depends(get_chapter_service),
) -> list[ChapterResponse]:
    try:
        if scope_organization_id is not None and organization_id != scope_organization_id:
            return []
        chapters = await service.get_chapters_by_organization(organization_id)
        return [ChapterResponse.model_validate(chapter) for chapter in chapters]
    except Exception as exc:
        return translate_service_exception(exc)


@router.get(
    "/{chapter_id}",
    response_model=ChapterResponse,
    status_code=status.HTTP_200_OK,
    summary="Get chapter",
    description="Fetch a single chapter by its identifier.",
)
async def get_chapter(
    chapter_id: UUID,
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
    service: ChapterService = Depends(get_chapter_service),
) -> ChapterResponse:
    try:
        chapter = await service.get_chapter(chapter_id, scope_organization_id)
        if chapter is None:
            raise ValueError("Chapter not found")
        return ChapterResponse.model_validate(chapter)
    except Exception as exc:
        return translate_service_exception(exc)


@router.patch(
    "/{chapter_id}",
    response_model=ChapterResponse,
    status_code=status.HTTP_200_OK,
    summary="Update chapter",
    description="Partially update a chapter by its identifier.",
)
async def update_chapter(
    chapter_id: UUID,
    payload: ChapterUpdate,
    service: ChapterService = Depends(get_chapter_service),
    current_user: Member = Depends(require_treasurer),
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
) -> ChapterResponse:
    try:
        data = payload.model_dump(exclude_unset=True)
        if current_user.role != Role.SUPERADMIN:
            data.pop("organization_id", None)
        chapter = await service.update_chapter(
            chapter_id,
            scope_organization_id,
            **data,
        )
        return ChapterResponse.model_validate(chapter)
    except Exception as exc:
        return translate_service_exception(exc)


@router.delete(
    "/{chapter_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete chapter",
    description="Delete a chapter by its identifier.",
)
async def delete_chapter(
    chapter_id: UUID,
    service: ChapterService = Depends(get_chapter_service),
    current_user: Member = Depends(require_admin),
    scope_organization_id: uuid.UUID | None = Depends(get_scope_organization_id),
) -> MessageResponse:
    try:
        await service.delete_chapter(chapter_id, scope_organization_id)
        return MessageResponse(message="Chapter deleted successfully")
    except Exception as exc:
        return translate_service_exception(exc)
