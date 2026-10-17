import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.event import EventStatus
from app.models.event import Event
from app.repositories.chapter_repository import ChapterRepository
from app.repositories.event_repository import EventRepository
from app.services.base import BaseService


class EventService(BaseService):
    """Service layer for event use cases.

    An event either belongs to a Chapter (most events) or directly to an
    Organization with no chapter (a club-wide event, e.g. an annual flagship
    event). organization_id is always set on the event either way.
    """

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.event_repository = EventRepository(session)
        self.chapter_repository = ChapterRepository(session)

    async def create_event(self, scope_organization_id: uuid.UUID | None, **data: Any) -> Event:
        """Create an event, either under an existing chapter or directly
        under an organization (club-wide)."""
        data.pop("title", None)  # `title` is a read-only alias for `name`, not a column
        chapter_id = data.get("chapter_id")

        if chapter_id is not None:
            chapter = await self.chapter_repository.get_by_id(chapter_id)
            if chapter is None:
                raise ValueError("Chapter not found")
            if scope_organization_id is not None and chapter.organization_id != scope_organization_id:
                raise ValueError("Chapter not found")
            data["organization_id"] = chapter.organization_id
        else:
            target_organization_id = scope_organization_id or data.get("organization_id")
            if target_organization_id is None:
                raise ValueError("organization_id is required for a club-wide event")
            data["organization_id"] = target_organization_id

        return await self._run_in_transaction(lambda: self.event_repository.create(**data))

    async def get_event(
        self, event_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> Event | None:
        """Return an event by id, scoped to the caller's organization."""
        event = await self.event_repository.get_by_id(event_id)
        if event is None:
            return None
        if organization_id is not None and event.organization_id != organization_id:
            return None
        return event

    async def update_event(
        self, event_id: uuid.UUID, organization_id: uuid.UUID | None, **data: Any
    ) -> Event:
        """Update an existing event, scoped to the caller's organization."""
        event = await self._get_scoped_event(event_id, organization_id)

        data.pop("title", None)  # `title` is a read-only alias for `name`, not a column
        chapter_id = data.get("chapter_id")
        if chapter_id is not None:
            chapter = await self.chapter_repository.get_by_id(chapter_id)
            if chapter is None or chapter.organization_id != event.organization_id:
                raise ValueError("Chapter not found")

        return await self._run_in_transaction(
            lambda: self.event_repository.update(event, **data)
        )

    async def archive_event(
        self, event_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> Event:
        """Soft-archive an event without deleting historical records."""
        return await self.update_event(
            event_id,
            organization_id,
            status=EventStatus.ARCHIVED,
        )

    async def delete_event(
        self, event_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> None:
        """Delete an event by id, scoped to the caller's organization."""
        event = await self._get_scoped_event(event_id, organization_id)

        await self._run_in_transaction(lambda: self._delete_event_instance(event))

    async def get_events_by_chapter(self, chapter_id: uuid.UUID) -> list[Event]:
        """Return all events for a chapter."""
        return await self.event_repository.get_by_chapter(chapter_id)

    async def get_all_events(self, organization_id: uuid.UUID | None) -> list[Event]:
        """Return all events for the caller's organization (chapter-scoped
        and club-wide alike)."""
        return await self.event_repository.get_by_organization(organization_id)

    async def _delete_event_instance(self, event: Event) -> None:
        await self.event_repository.delete(event)

    async def _get_scoped_event(
        self, event_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> Event:
        """Fetch an event and verify it belongs to the given organization."""
        event = await self.event_repository.get_by_id(event_id)
        if event is None:
            raise ValueError("Event not found")
        if organization_id is not None and event.organization_id != organization_id:
            raise ValueError("Event not found")
        return event
