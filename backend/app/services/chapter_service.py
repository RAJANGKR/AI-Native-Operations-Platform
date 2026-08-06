import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chapter import Chapter
from app.repositories.chapter_repository import ChapterRepository
from app.repositories.organization_repository import OrganizationRepository
from app.services.base import BaseService


class ChapterService(BaseService):
    """Service layer for chapter use cases."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.chapter_repository = ChapterRepository(session)
        self.organization_repository = OrganizationRepository(session)

    async def create_chapter(self, **data: Any) -> Chapter:
        """Create a chapter for an existing organization."""
        organization_id = data.get("organization_id")
        if organization_id is None:
            raise ValueError("organization_id is required")

        organization = await self.organization_repository.get_by_id(organization_id)
        if organization is None:
            raise ValueError("Organization not found")

        return await self._run_in_transaction(
            lambda: self.chapter_repository.create(**data)
        )

    async def get_chapter(self, chapter_id: uuid.UUID) -> Chapter | None:
        """Return a chapter by id."""
        return await self.chapter_repository.get_by_id(chapter_id)

    async def update_chapter(self, chapter_id: uuid.UUID, **data: Any) -> Chapter:
        """Update an existing chapter."""
        chapter = await self.chapter_repository.get_by_id(chapter_id)
        if chapter is None:
            raise ValueError("Chapter not found")

        organization_id = data.get("organization_id")
        if organization_id is not None:
            organization = await self.organization_repository.get_by_id(organization_id)
            if organization is None:
                raise ValueError("Organization not found")

        return await self._run_in_transaction(
            lambda: self.chapter_repository.update(chapter, **data)
        )

    async def delete_chapter(self, chapter_id: uuid.UUID) -> None:
        """Delete a chapter by id."""
        chapter = await self.chapter_repository.get_by_id(chapter_id)
        if chapter is None:
            raise ValueError("Chapter not found")

        await self._run_in_transaction(lambda: self._delete_chapter_instance(chapter))

    async def get_chapters_by_organization(
        self, organization_id: uuid.UUID
    ) -> list[Chapter]:
        """Return all chapters for an organization."""
        return await self.chapter_repository.get_by_organization(organization_id)

    async def _delete_chapter_instance(self, chapter: Chapter) -> None:
        await self.chapter_repository.delete(chapter)
