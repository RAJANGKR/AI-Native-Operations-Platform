from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel, DescriptionStr, NameStr, TimestampedResponse


class ChapterCreate(APIModel):
    """Schema for creating a chapter."""

    organization_id: UUID = Field(description="Organization identifier")
    name: NameStr
    description: DescriptionStr | None = Field(
        default=None,
        description="Optional chapter description",
        examples=["Treasury and AI initiatives for the organization"],
    )
    is_active: bool = Field(
        default=True,
        description="Whether the chapter is active",
    )


class ChapterUpdate(APIModel):
    """Schema for updating a chapter."""

    organization_id: UUID | None = Field(
        default=None,
        description="Organization identifier",
    )
    name: NameStr | None = None
    description: DescriptionStr | None = Field(
        default=None,
        description="Optional chapter description",
    )
    is_active: bool | None = Field(
        default=None,
        description="Whether the chapter is active",
    )


class ChapterResponse(TimestampedResponse):
    """Schema returned for chapter resources."""

    organization_id: UUID = Field(description="Organization identifier")
    name: str = Field(description="Chapter name")
    description: str | None = Field(
        default=None,
        description="Optional chapter description",
    )
    is_active: bool = Field(description="Whether the chapter is active")
