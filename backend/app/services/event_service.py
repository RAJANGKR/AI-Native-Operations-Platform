import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.repositories.chapter_repository import ChapterRepository
from app.repositories.event_repository import EventRepository
from app.services.base import BaseService


class EventService(BaseService):
    """Service layer for event use cases."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.event_repository = EventRepository(session)
        self.chapter_repository = ChapterRepository(session)

    async def create_event(self, **data: Any) -> Event:
        """Create an event for an existing chapter."""
        chapter_id = data.get("chapter_id")
        if chapter_id is None:
            raise ValueError("chapter_id is required")

        chapter = await self.chapter_repository.get_by_id(chapter_id)
        if chapter is None:
            raise ValueError("Chapter not found")

        return await self._run_in_transaction(lambda: self.event_repository.create(**data))

    async def get_event(self, event_id: uuid.UUID) -> Event | None:
        """Return an event by id."""
        return await self.event_repository.get_by_id(event_id)

    async def update_event(self, event_id: uuid.UUID, **data: Any) -> Event:
        """Update an existing event."""
        event = await self.event_repository.get_by_id(event_id)
        if event is None:
            raise ValueError("Event not found")

        chapter_id = data.get("chapter_id")
        if chapter_id is not None:
            chapter = await self.chapter_repository.get_by_id(chapter_id)
            if chapter is None:
                raise ValueError("Chapter not found")

        return await self._run_in_transaction(
            lambda: self.event_repository.update(event, **data)
        )

    async def delete_event(self, event_id: uuid.UUID) -> None:
        """Delete an event by id."""
        event = await self.event_repository.get_by_id(event_id)
        if event is None:
            raise ValueError("Event not found")

        await self._run_in_transaction(lambda: self._delete_event_instance(event))

    async def get_events_by_chapter(self, chapter_id: uuid.UUID) -> list[Event]:
        """Return all events for a chapter."""
        return await self.event_repository.get_by_chapter(chapter_id)

    async def _delete_event_instance(self, event: Event) -> None:
        await self.event_repository.delete(event)
