from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_event_service,
    require_admin,
    require_treasurer,
    translate_service_exception,
)
from app.models.member import Member
from app.schemas.common import MessageResponse
from app.schemas.event import EventCreate, EventResponse, EventUpdate
from app.services.event_service import EventService

router = APIRouter(prefix="/events", tags=["Events"])


@router.get(
    "/",
    response_model=list[EventResponse],
    status_code=status.HTTP_200_OK,
    summary="List all events",
    description="Return all events.",
)
async def get_events(
    service: EventService = Depends(get_event_service),
) -> list[EventResponse]:
    try:
        events = await service.get_all_events()
        return [EventResponse.model_validate(event) for event in events]
    except Exception as exc:
        translate_service_exception(exc)


@router.post(
    "/",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create event",
    description="Create a new event resource.",
)
async def create_event(
    payload: EventCreate,
    service: EventService = Depends(get_event_service),
    current_user: Member = Depends(require_treasurer),
) -> EventResponse:
    try:
        event = await service.create_event(**payload.model_dump())
        return EventResponse.model_validate(event)
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/chapter/{chapter_id}",
    response_model=list[EventResponse],
    status_code=status.HTTP_200_OK,
    summary="List events by chapter",
    description="Return all events belonging to a chapter.",
)
async def get_events_by_chapter(
    chapter_id: UUID,
    service: EventService = Depends(get_event_service),
) -> list[EventResponse]:
    try:
        events = await service.get_events_by_chapter(chapter_id)
        return [EventResponse.model_validate(event) for event in events]
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/{event_id}",
    response_model=EventResponse,
    status_code=status.HTTP_200_OK,
    summary="Get event",
    description="Fetch a single event by its identifier.",
)
async def get_event(
    event_id: UUID,
    service: EventService = Depends(get_event_service),
) -> EventResponse:
    try:
        event = await service.get_event(event_id)
        if event is None:
            raise ValueError("Event not found")
        return EventResponse.model_validate(event)
    except Exception as exc:
        translate_service_exception(exc)


@router.patch(
    "/{event_id}",
    response_model=EventResponse,
    status_code=status.HTTP_200_OK,
    summary="Update event",
    description="Partially update an event by its identifier.",
)
async def update_event(
    event_id: UUID,
    payload: EventUpdate,
    service: EventService = Depends(get_event_service),
    current_user: Member = Depends(require_treasurer),
) -> EventResponse:
    try:
        event = await service.update_event(
            event_id,
            **payload.model_dump(exclude_unset=True),
        )
        return EventResponse.model_validate(event)
    except Exception as exc:
        translate_service_exception(exc)


@router.delete(
    "/{event_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete event",
    description="Delete an event by its identifier.",
)
async def delete_event(
    event_id: UUID,
    service: EventService = Depends(get_event_service),
    current_user: Member = Depends(require_admin),
) -> MessageResponse:
    try:
        await service.delete_event(event_id)
        return MessageResponse(message="Event deleted successfully")
    except Exception as exc:
        translate_service_exception(exc)
