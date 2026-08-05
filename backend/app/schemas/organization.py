from typing import Annotated

from pydantic import Field

from app.schemas.common import (
    APIModel,
    CurrencyCodeStr,
    ShortTextStr,
    TimestampedResponse,
)

OrganizationNameStr = Annotated[
    str,
    Field(
        min_length=1,
        max_length=255,
        description="Organization display name",
        examples=["Acme Operations"],
    ),
]


class OrganizationCreate(APIModel):
    """Schema for creating an organization."""

    name: OrganizationNameStr
    industry: ShortTextStr | None = Field(
        default=None,
        description="Industry or business sector",
        examples=["Finance"],
    )
    currency: CurrencyCodeStr = Field(
        default="INR",
        description="Default currency used by the organization",
        examples=["INR"],
    )


class OrganizationUpdate(APIModel):
    """Schema for updating an organization."""

    name: OrganizationNameStr | None = None
    industry: ShortTextStr | None = Field(
        default=None,
        description="Industry or business sector",
        examples=["Finance"],
    )
    currency: CurrencyCodeStr | None = Field(
        default=None,
        description="Default currency used by the organization",
        examples=["USD"],
    )


class OrganizationResponse(TimestampedResponse):
    """Schema returned for organization resources."""

    name: str = Field(description="Organization display name")
    industry: str | None = Field(
        default=None,
        description="Industry or business sector",
    )
    currency: str = Field(description="Default organization currency")
