import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import jwt
import pytest
from httpx import ASGITransport, AsyncClient

from app.api.dependencies import get_auth_service, get_member_service
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.enums.role import Role
from app.main import app
from app.models.member import Member
from app.services.auth_service import AuthService
from app.services.member_service import MemberService


def test_password_hashing_and_verification():
    """Verify password hashing and verification logic."""
    raw_password = "SuperSecretPassword123!"
    hashed = hash_password(raw_password)

    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False
    assert verify_password("", hashed) is False
    assert verify_password(raw_password, "") is False


def test_jwt_generation_and_decoding():
    """Verify JWT access token creation and payload decoding."""
    user_id = str(uuid.uuid4())
    data = {
        "sub": "user@example.com",
        "user_id": user_id,
        "role": Role.TREASURER.value,
    }

    token = create_access_token(data)
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded["sub"] == "user@example.com"
    assert decoded["user_id"] == user_id
    assert decoded["role"] == Role.TREASURER.value
    assert "exp" in decoded
    assert decoded["type"] == "access"


@pytest.mark.asyncio
async def test_auth_openapi_endpoints():
    """Verify auth endpoints are present in FastAPI OpenAPI schema."""
    openapi = app.openapi()
    paths = openapi["paths"]
    assert "/api/v1/auth/login" in paths
    assert "/api/v1/auth/me" in paths


@pytest.mark.asyncio
async def test_auth_service_authenticate_success():
    """Verify successful authentication with matching password."""
    mock_session = AsyncMock()
    service = AuthService(mock_session)

    hashed = hash_password("CorrectPassword123!")
    user_id = uuid.uuid4()
    mock_user = Member(
        id=user_id,
        organization_id=uuid.uuid4(),
        email="testuser@example.com",
        full_name="Test User",
        hashed_password=hashed,
        role=Role.MEMBER,
        is_active=True,
    )

    service.member_repository.get_user_by_email = AsyncMock(return_value=mock_user)

    authenticated_user = await service.authenticate_user("testuser@example.com", "CorrectPassword123!")
    assert authenticated_user.id == user_id
    assert authenticated_user.email == "testuser@example.com"


@pytest.mark.asyncio
async def test_auth_service_authenticate_wrong_password():
    """Verify authentication failure with incorrect password."""
    mock_session = AsyncMock()
    service = AuthService(mock_session)

    hashed = hash_password("CorrectPassword123!")
    mock_user = Member(
        id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        email="testuser@example.com",
        full_name="Test User",
        hashed_password=hashed,
        role=Role.MEMBER,
        is_active=True,
    )

    service.member_repository.get_user_by_email = AsyncMock(return_value=mock_user)

    with pytest.raises(ValueError, match="Invalid email or password"):
        await service.authenticate_user("testuser@example.com", "WrongPassword!")


@pytest.mark.asyncio
async def test_auth_service_rejects_pending_member_before_login():
    """Pending registrations must not authenticate before admin approval."""
    service = AuthService(AsyncMock())
    mock_user = Member(
        id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        email="pending@example.com",
        full_name="Pending User",
        hashed_password=hash_password("CorrectPassword123!"),
        role=Role.MEMBER,
        approval_status="PENDING",
        is_active=True,
    )
    service.member_repository.get_user_by_email = AsyncMock(return_value=mock_user)

    with pytest.raises(ValueError, match="pending Treasurer approval"):
        await service.authenticate_user("pending@example.com", "CorrectPassword123!")


@pytest.mark.asyncio
async def test_member_approval_sets_approved_and_active():
    """The existing approval path promotes only the selected member."""
    service = MemberService(AsyncMock())
    member_id = uuid.uuid4()
    organization_id = uuid.uuid4()
    mock_user = Member(
        id=member_id,
        organization_id=organization_id,
        email="pending@example.com",
        full_name="Pending User",
        role=Role.MEMBER,
        approval_status="PENDING",
        is_active=False,
    )
    service.member_repository.get_by_id = AsyncMock(return_value=mock_user)
    service.member_repository.update = AsyncMock(
        side_effect=lambda member, **updates: member
    )

    await service.approve_member(member_id, organization_id)

    service.member_repository.update.assert_awaited_once_with(
        mock_user,
        approval_status="APPROVED",
        is_active=True,
    )


@pytest.mark.asyncio
async def test_admin_can_recover_pending_member_but_member_cannot():
    """Approval route stays admin-only and recovers only the chosen member."""
    organization_id = uuid.uuid4()
    pending_id = uuid.uuid4()
    pending_member = Member(
        id=pending_id,
        organization_id=organization_id,
        email="pending@example.com",
        full_name="Pending User",
        role=Role.MEMBER,
        approval_status="APPROVED",
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    service = AsyncMock()
    service.approve_member.return_value = pending_member
    app.dependency_overrides[get_member_service] = lambda: service

    async def request_as(role):
        caller = Member(
            id=uuid.uuid4(),
            organization_id=organization_id,
            email="caller@example.com",
            full_name="Caller",
            role=role,
            approval_status="PENDING",
            is_active=True,
        )
        auth_service = AuthService(AsyncMock())
        auth_service.member_repository.get_by_id = AsyncMock(return_value=caller)
        app.dependency_overrides[get_auth_service] = lambda: auth_service
        token = create_access_token(
            {"sub": caller.email, "user_id": str(caller.id), "role": role.value}
        )
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            return await client.post(
                f"/api/v1/members/{pending_id}/approve",
                headers={"Authorization": f"Bearer {token}"},
            )

    try:
        admin_response = await request_as(Role.ADMIN)
        assert admin_response.status_code == 200
        assert admin_response.json()["approval_status"] == "APPROVED"
        service.approve_member.assert_awaited_once_with(pending_id, organization_id)

        service.approve_member.reset_mock()
        member_response = await request_as(Role.MEMBER)
        assert member_response.status_code == 403
        service.approve_member.assert_not_awaited()
    finally:
        app.dependency_overrides.pop(get_auth_service, None)
        app.dependency_overrides.pop(get_member_service, None)


@pytest.mark.asyncio
async def test_auth_service_login_returns_token_and_user():
    """Verify login() generates valid token and CurrentUserResponse structure."""
    mock_session = AsyncMock()
    service = AuthService(mock_session)

    hashed = hash_password("Password123!")
    user_id = uuid.uuid4()
    mock_user = Member(
        id=user_id,
        organization_id=uuid.uuid4(),
        email="treasurer@example.com",
        full_name="Treasurer User",
        hashed_password=hashed,
        role=Role.TREASURER,
        is_active=True,
    )

    service.member_repository.get_user_by_email = AsyncMock(return_value=mock_user)

    login_resp = await service.login("treasurer@example.com", "Password123!")
    assert login_resp.access_token is not None
    assert login_resp.token_type == "bearer"
    assert login_resp.expires_in == 900
    assert login_resp.user.email == "treasurer@example.com"
    assert login_resp.user.role == Role.TREASURER


@pytest.mark.asyncio
async def test_get_current_user_from_token():
    """Verify get_current_user decodes token and fetches active user."""
    mock_session = AsyncMock()
    service = AuthService(mock_session)

    user_id = uuid.uuid4()
    mock_user = Member(
        id=user_id,
        organization_id=uuid.uuid4(),
        email="admin@example.com",
        full_name="Admin User",
        role=Role.ADMIN,
        is_active=True,
    )
    service.member_repository.get_by_id = AsyncMock(return_value=mock_user)

    token = create_access_token({"sub": "admin@example.com", "user_id": str(user_id), "role": "ADMIN"})
    current_user = await service.get_current_user(token)

    assert current_user.id == user_id
    assert current_user.email == "admin@example.com"
    assert current_user.role == Role.ADMIN


@pytest.mark.asyncio
async def test_get_current_user_invalid_token():
    """Verify decoding invalid token raises error."""
    mock_session = AsyncMock()
    service = AuthService(mock_session)

    with pytest.raises(ValueError, match="Invalid authentication token"):
        await service.get_current_user("invalid.jwt.token")


@pytest.mark.asyncio
async def test_authenticate_user_unknown_email_does_not_create_account():
    """An unrecognized email must be rejected, never silently registered.

    Regression test: authenticate_user() previously auto-created a Member
    (with a role derived from the email string) on first login with any
    unseen email, which was an unauthenticated account-creation and
    privilege-escalation path.
    """
    mock_session = AsyncMock()
    service = AuthService(mock_session)

    service.member_repository.get_user_by_email = AsyncMock(return_value=None)

    with pytest.raises(ValueError, match="Invalid email or password"):
        await service.authenticate_user("nobody@example.com", "whatever-password")

    mock_session.add.assert_not_called()
    mock_session.commit.assert_not_called()


@pytest.mark.asyncio
async def test_authenticate_user_rejects_account_without_password_hash():
    service = AuthService(AsyncMock())
    user = Member(
        id=uuid.uuid4(),
        organization_id=uuid.uuid4(),
        email="passwordless@example.com",
        full_name="Passwordless User",
        hashed_password=None,
        role=Role.MEMBER,
        is_active=True,
    )
    service.member_repository.get_user_by_email = AsyncMock(return_value=user)

    with pytest.raises(ValueError, match="Invalid email or password"):
        await service.authenticate_user("passwordless@example.com", "arbitrary-password")

    service.session.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_get_current_user_rejects_non_access_token_type():
    service = AuthService(AsyncMock())
    service.member_repository.get_by_id = AsyncMock()
    from app.core.config import settings

    token = jwt.encode(
        {
            "sub": "admin@example.com",
            "user_id": str(uuid.uuid4()),
            "iat": int(datetime.now(timezone.utc).timestamp()),
            "exp": int(datetime.now(timezone.utc).timestamp()) + 60,
            "type": "refresh",
        },
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    with pytest.raises(ValueError, match="Invalid authentication token"):
        await service.get_current_user(token)

    service.member_repository.get_by_id.assert_not_awaited()
