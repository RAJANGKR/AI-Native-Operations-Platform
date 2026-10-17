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
    RegisterRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=CurrentUserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Student Self-Registration",
    description="Register a new student member account with PENDING Treasurer approval status.",
)
async def register(
    payload: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
) -> CurrentUserResponse:
    try:
        member = await service.register_user(
            full_name=payload.full_name,
            email=payload.email,
            department=payload.department,
            year=payload.year,
            password=payload.password,
        )
        return CurrentUserResponse.model_validate(member)
    except Exception as exc:
        translate_service_exception(exc)


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
