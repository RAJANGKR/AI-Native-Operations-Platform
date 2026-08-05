from typing import Annotated
from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.common import APIModel, RoleStr, TimestampedResponse

FullNameStr = Annotated[
    str,
    Field(
        min_length=1,
        max_length=255,
        description="Full name of the member",
        examples=["Rajan Gupta"],
    ),
]


class MemberCreate(APIModel):
    """Schema for creating a member."""

    organization_id: UUID = Field(description="Organization identifier")
    email: EmailStr = Field(
        description="Unique email address for the member",
        examples=["rajan@example.com"],
    )
    full_name: FullNameStr
    role: RoleStr = Field(
        default="member",
        description="Role assigned to the member",
        examples=["member"],
    )
    is_active: bool = Field(
        default=True,
        description="Whether the member is active",
    )


class MemberUpdate(APIModel):
    """Schema for updating a member."""

    organization_id: UUID | None = Field(
        default=None,
        description="Organization identifier",
    )
    email: EmailStr | None = Field(
        default=None,
        description="Unique email address for the member",
        examples=["rajan@example.com"],
    )
    full_name: FullNameStr | None = None
    role: RoleStr | None = Field(
        default=None,
        description="Role assigned to the member",
        examples=["approver"],
    )
    is_active: bool | None = Field(
        default=None,
        description="Whether the member is active",
    )


class MemberResponse(TimestampedResponse):
    """Schema returned for member resources."""

    organization_id: UUID = Field(description="Organization identifier")
    email: EmailStr = Field(description="Unique email address for the member")
    full_name: str = Field(description="Full name of the member")
    role: str = Field(description="Role assigned to the member")
    is_active: bool = Field(description="Whether the member is active")
