import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chapter import Chapter
from app.repositories.base import BaseRepository


class ChapterRepository(BaseRepository[Chapter]):
    """Database access methods for chapters."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session=session, model=Chapter)

    async def get_by_organization(self, organization_id: uuid.UUID) -> list[Chapter]:
        """Return all chapters for an organization."""
        statement = select(Chapter).where(Chapter.organization_id == organization_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_by_name(self, name: str) -> Chapter | None:
        """Return a chapter by its name."""
        statement = select(Chapter).where(Chapter.name == name)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()
