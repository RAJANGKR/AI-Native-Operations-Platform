import logging
import uuid
from datetime import timedelta
from typing import Any

from app.core.config import settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.models.member import Member
from app.repositories.member_repository import MemberRepository
from app.schemas.auth import CurrentUserResponse, LoginResponse
from app.services.base import BaseService

logger = logging.getLogger(__name__)


from sqlalchemy import select

from app.enums.role import Role
from app.models.organization import Organization


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
            raise ValueError("Invalid email or password")

        if getattr(user, "approval_status", "APPROVED") == "PENDING":
            raise ValueError("Account pending Treasurer approval. Please wait for Treasurer authorization.")

        if getattr(user, "approval_status", "APPROVED") == "REJECTED":
            raise ValueError("Registration rejected by Treasurer.")

        # A missing password hash is not a first-login invitation: accepting
        # any password here would let anyone claim a legacy/passwordless row.
        if not user.hashed_password or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")

        return user

    async def register_user(
        self,
        full_name: str,
        email: str,
        department: str,
        year: str,
        password: str,
    ) -> Member:
        """Register a new student account with PENDING approval status."""
        existing = await self.member_repository.get_user_by_email(email)
        if existing is not None:
            raise ValueError("An account with this college email already exists.")

        org_stmt = select(Organization)
        org_result = await self.session.execute(org_stmt)
        org = org_result.scalars().first()

        if org is None:
            org = Organization(
                id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
                name="Apex Operations Org",
                currency="INR",
            )
            self.session.add(org)
            await self.session.flush()

        hashed = hash_password(password)
        new_member = Member(
            id=uuid.uuid4(),
            organization_id=org.id,
            email=email,
            full_name=full_name,
            department=department,
            year=year,
            role=Role.MEMBER,
            hashed_password=hashed,
            approval_status="PENDING",
            is_active=True,
        )
        self.session.add(new_member)
        await self.session.commit()
        await self.session.refresh(new_member)
        return new_member

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

        if payload.get("type") != "access":
            raise ValueError("Invalid authentication token")

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
