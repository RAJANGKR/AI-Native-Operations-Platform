from datetime import datetime
from uuid import UUID
from pydantic import EmailStr, Field

from app.enums.role import Role
from app.schemas.common import APIModel, ORMResponseModel


class LoginRequest(APIModel):
    """Schema for user authentication request."""

    email: EmailStr = Field(description="User email address")
    password: str = Field(min_length=1, description="Plain text password")


class TokenPayload(APIModel):
    """Payload stored within JWT access token."""

    sub: str = Field(description="Subject identifier (user email or UUID)")
    user_id: UUID = Field(description="User identifier")
    role: Role = Field(description="User access role")
    exp: int = Field(description="Token expiration UNIX timestamp")
    type: str = Field(default="access", description="Token type")


class CurrentUserResponse(ORMResponseModel):
    """Schema returned for currently authenticated user information."""

    id: UUID = Field(description="User identifier")
    email: EmailStr = Field(description="User email address")
    full_name: str = Field(description="User full name")
    role: Role = Field(description="User access role")
    organization_id: UUID = Field(description="Organization identifier")
    is_active: bool = Field(default=True, description="Account active status")
    created_at: datetime | None = Field(default=None, description="Creation timestamp")
    updated_at: datetime | None = Field(default=None, description="Last update timestamp")


class LoginResponse(APIModel):
    """Schema returned upon successful authentication."""

    access_token: str = Field(description="JWT access token string")
    token_type: str = Field(default="bearer", description="Token authentication scheme")
    expires_in: int = Field(default=900, description="Expiration duration in seconds")
    user: CurrentUserResponse = Field(description="Authenticated user profile metadata")
