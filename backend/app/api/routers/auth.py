from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    get_auth_service,
    get_current_user,
    translate_service_exception,
)
from app.models.member import Member
from app.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    LoginResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Authenticate user email and password, returning JWT access token.",
)
async def login(
    payload: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> LoginResponse:
    try:
        return await service.login(email=payload.email, password=payload.password)
    except Exception as exc:
        translate_service_exception(exc)


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile",
    description="Retrieve profile metadata of the currently authenticated user.",
)
async def get_me(
    current_user: Member = Depends(get_current_user),
) -> CurrentUserResponse:
    return CurrentUserResponse.model_validate(current_user)
