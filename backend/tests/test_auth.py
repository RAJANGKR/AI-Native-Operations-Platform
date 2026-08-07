import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock

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
