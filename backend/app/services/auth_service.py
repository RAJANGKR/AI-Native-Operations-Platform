import logging
import uuid
from datetime import timedelta
from typing import Any

from app.core.config import settings
from app.core.security import create_access_token, decode_access_token, verify_password
from app.models.member import Member
from app.repositories.member_repository import MemberRepository
from app.schemas.auth import CurrentUserResponse, LoginResponse
from app.services.base import BaseService

logger = logging.getLogger(__name__)


class AuthService(BaseService):
    """Service layer for authentication and identity management."""

    def __init__(self, session: Any) -> None:
        super().__init__(session)
        self.member_repository = MemberRepository(session)

    async def authenticate_user(self, email: str, password: str) -> Member:
        """Authenticate user credentials against hashed password in database."""
        user = await self.member_repository.get_user_by_email(email)
        if user is None:
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("User account is inactive")

        # If hashed_password is set, verify against plain password
        if user.hashed_password:
            if not verify_password(password, user.hashed_password):
                raise ValueError("Invalid email or password")
        else:
            # For development seed members without set password, allow initial authentication
            logger.info(f"User {email} has no password hash set; allowing initial auth.")

        return user

    async def login(self, email: str, password: str) -> LoginResponse:
        """Authenticate credentials and generate JWT access token."""
        user = await self.authenticate_user(email, password)

        role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
        token_data = {
            "sub": str(user.email),
            "user_id": str(user.id),
            "role": role_str,
        }

        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(data=token_data, expires_delta=expires_delta)

        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=CurrentUserResponse.model_validate(user),
        )

    async def get_current_user(self, token: str) -> Member:
        """Validate JWT access token and return current authenticated user."""
        try:
            payload = decode_access_token(token)
        except Exception as exc:
            raise ValueError(f"Invalid authentication token: {exc}")

        user_id_str = payload.get("user_id")
        email_str = payload.get("sub")

        user: Member | None = None
        if user_id_str:
            try:
                user = await self.member_repository.get_by_id(uuid.UUID(user_id_str))
            except Exception:
                user = None

        if user is None and email_str:
            user = await self.member_repository.get_user_by_email(email_str)

        if user is None:
            raise ValueError("User matching authentication token not found")

        if not user.is_active:
            raise ValueError("User account is inactive")

        return user
