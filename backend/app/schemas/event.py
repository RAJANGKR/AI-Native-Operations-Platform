from datetime import date
from uuid import UUID

from pydantic import Field

from app.enums.event import EventStatus
from app.schemas.common import APIModel, DescriptionStr, NameStr, TimestampedResponse


class EventCreate(APIModel):
    """Schema for creating an event."""

    chapter_id: UUID = Field(description="Chapter identifier")
    name: NameStr
    description: DescriptionStr | None = Field(
        default=None,
        description="Optional event description",
        examples=["Annual technical showcase and fundraising event"],
    )
    start_date: date | None = Field(
        default=None,
        description="Event start date",
    )
    end_date: date | None = Field(
        default=None,
        description="Event end date",
    )
    status: EventStatus = Field(
        default=EventStatus.PLANNED,
        description="Current event lifecycle status",
    )


class EventUpdate(APIModel):
    """Schema for updating an event."""

    chapter_id: UUID | None = Field(default=None, description="Chapter identifier")
    name: NameStr | None = None
    description: DescriptionStr | None = Field(
        default=None,
        description="Optional event description",
    )
    start_date: date | None = Field(
        default=None,
        description="Event start date",
    )
    end_date: date | None = Field(
        default=None,
        description="Event end date",
    )
    status: EventStatus | None = Field(
        default=None,
        description="Current event lifecycle status",
    )


class EventResponse(TimestampedResponse):
    """Schema returned for event resources."""

    chapter_id: UUID = Field(description="Chapter identifier")
    name: str = Field(description="Event name")
    description: str | None = Field(
        default=None,
        description="Optional event description",
    )
    start_date: date | None = Field(default=None, description="Event start date")
    end_date: date | None = Field(default=None, description="Event end date")
    status: EventStatus = Field(description="Current event lifecycle status")
