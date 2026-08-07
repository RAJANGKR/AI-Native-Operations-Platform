from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import Field, model_validator

from app.enums.event import EventStatus
from app.schemas.common import APIModel, DescriptionStr, NameStr, TimestampedResponse


class EventCreate(APIModel):
    """Schema for creating an event."""

    chapter_id: UUID = Field(description="Chapter identifier")
    name: NameStr = Field(default="Untitled Event")
    title: str | None = Field(default=None, description="Event title alias for name")
    description: DescriptionStr | None = Field(
        default=None,
        description="Optional event description",
        examples=["Annual technical showcase and fundraising event"],
    )
    budget: Decimal = Field(
        default=Decimal("0.00"),
        description="Allocated budget for event",
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
    created_by: UUID | None = Field(
        default=None,
        description="User identifier who created the event",
    )

    @model_validator(mode="before")
    @classmethod
    def populate_name_from_title(cls, data: any) -> any:
        if isinstance(data, dict):
            if "title" in data and data["title"] and ("name" not in data or not data["name"]):
                data["name"] = data["title"]
        return data


class EventUpdate(APIModel):
    """Schema for updating an event."""

    chapter_id: UUID | None = Field(default=None, description="Chapter identifier")
    name: NameStr | None = None
    title: str | None = Field(default=None, description="Event title alias for name")
    description: DescriptionStr | None = Field(
        default=None,
        description="Optional event description",
    )
    budget: Decimal | None = Field(
        default=None,
        description="Allocated budget for event",
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
    created_by: UUID | None = Field(
        default=None,
        description="User identifier who created the event",
    )

    @model_validator(mode="before")
    @classmethod
    def populate_name_from_title(cls, data: any) -> any:
        if isinstance(data, dict):
            if "title" in data and data["title"] and ("name" not in data or not data["name"]):
                data["name"] = data["title"]
        return data


class EventResponse(TimestampedResponse):
    """Schema returned for event resources."""

    chapter_id: UUID = Field(description="Chapter identifier")
    name: str = Field(description="Event name")
    title: str = Field(default="", description="Event title")
    description: str | None = Field(
        default=None,
        description="Optional event description",
    )
    budget: Decimal = Field(default=Decimal("0.00"), description="Allocated budget")
    start_date: date | None = Field(default=None, description="Event start date")
    end_date: date | None = Field(default=None, description="Event end date")
    status: EventStatus = Field(description="Current event lifecycle status")
    created_by: UUID | None = Field(default=None, description="Creator user identifier")

    @model_validator(mode="before")
    @classmethod
    def populate_title(cls, data: any) -> any:
        if hasattr(data, "name") and not getattr(data, "title", None):
            setattr(data, "title", getattr(data, "name"))
        elif isinstance(data, dict):
            if "name" in data and ("title" not in data or not data["title"]):
                data["title"] = data["name"]
        return data
