from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_chapter_service, translate_service_exception
from app.schemas.chapter import ChapterCreate, ChapterResponse, ChapterUpdate
from app.schemas.common import MessageResponse
from app.services.chapter_service import ChapterService

router = APIRouter(prefix="/chapters", tags=["Chapters"])


@router.post(
    "/",
    response_model=ChapterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create chapter",
    description="Create a new chapter resource.",
)
async def create_chapter(
    payload: ChapterCreate,
    service: ChapterService = Depends(get_chapter_service),
) -> ChapterResponse:
    try:
        chapter = await service.create_chapter(**payload.model_dump())
        return ChapterResponse.model_validate(chapter)
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/organization/{organization_id}",
    response_model=list[ChapterResponse],
    status_code=status.HTTP_200_OK,
    summary="List chapters by organization",
    description="Return all chapters belonging to an organization.",
)
async def get_chapters_by_organization(
    organization_id: UUID,
    service: ChapterService = Depends(get_chapter_service),
) -> list[ChapterResponse]:
    try:
        chapters = await service.get_chapters_by_organization(organization_id)
        return [ChapterResponse.model_validate(chapter) for chapter in chapters]
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/{chapter_id}",
    response_model=ChapterResponse,
    status_code=status.HTTP_200_OK,
    summary="Get chapter",
    description="Fetch a single chapter by its identifier.",
)
async def get_chapter(
    chapter_id: UUID,
    service: ChapterService = Depends(get_chapter_service),
) -> ChapterResponse:
    try:
        chapter = await service.get_chapter(chapter_id)
        if chapter is None:
            raise ValueError("Chapter not found")
        return ChapterResponse.model_validate(chapter)
    except Exception as exc:
        translate_service_exception(exc)


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
) -> ChapterResponse:
    try:
        chapter = await service.update_chapter(
            chapter_id,
            **payload.model_dump(exclude_unset=True),
        )
        return ChapterResponse.model_validate(chapter)
    except Exception as exc:
        translate_service_exception(exc)


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
) -> MessageResponse:
    try:
        await service.delete_chapter(chapter_id)
        return MessageResponse(message="Chapter deleted successfully")
    except Exception as exc:
        translate_service_exception(exc)
