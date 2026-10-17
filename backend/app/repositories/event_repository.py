import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.event import EventStatus
from app.models.event import Event
from app.repositories.base import BaseRepository


class EventRepository(BaseRepository[Event]):
    """Database access methods for events."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session=session, model=Event)

    async def get_by_organization(self, organization_id: uuid.UUID | None) -> list[Event]:
        """Return all events for an organization (chapter-scoped and
        club-wide alike), or every event if None."""
        statement = select(Event)
        if organization_id is not None:
            statement = statement.where(Event.organization_id == organization_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_by_chapter(self, chapter_id: uuid.UUID) -> list[Event]:
        """Return all events for a chapter."""
        statement = select(Event).where(Event.chapter_id == chapter_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_by_status(self, status: EventStatus) -> list[Event]:
        """Return all events with a given status."""
        statement = select(Event).where(Event.status == status)
        result = await self.session.execute(statement)
        return list(result.scalars().all())
