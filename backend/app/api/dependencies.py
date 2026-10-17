import uuid
from collections.abc import AsyncGenerator
from typing import NoReturn

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.storage import StorageOperationError
from app.db.session import SessionLocal
from app.enums.role import Role
from app.models.member import Member
from app.services.attachment_service import AttachmentService
from app.services.auth_service import AuthService
from app.services.budget_service import BudgetService
from app.services.chapter_service import ChapterService
from app.services.dashboard_service import DashboardService
from app.services.event_service import EventService
from app.services.expense_report_service import ExpenseReportService
from app.services.expense_service import ExpenseService
from app.services.member_service import MemberService
from app.services.organization_service import OrganizationService
from app.services.receipt_ocr_service import ReceiptOCRService, receipt_ocr_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session."""
    async with SessionLocal() as session:
        yield session


def get_organization_service(
    session: AsyncSession = Depends(get_db),
) -> OrganizationService:
    """Create an organization service."""
    return OrganizationService(session)


def get_member_service(
    session: AsyncSession = Depends(get_db),
) -> MemberService:
    """Create a member service."""
    return MemberService(session)


def get_auth_service(
    session: AsyncSession = Depends(get_db),
) -> AuthService:
    """Create an auth service."""
    return AuthService(session)


def get_budget_service(
    session: AsyncSession = Depends(get_db),
) -> BudgetService:
    """Create a budget service."""
    return BudgetService(session)


def get_chapter_service(
    session: AsyncSession = Depends(get_db),
) -> ChapterService:
    """Create a chapter service."""
    return ChapterService(session)


def get_event_service(
    session: AsyncSession = Depends(get_db),
) -> EventService:
    """Create an event service."""
    return EventService(session)


def get_expense_report_service(
    session: AsyncSession = Depends(get_db),
) -> ExpenseReportService:
    """Create an expense report service."""
    return ExpenseReportService(session)


def get_expense_service(
    session: AsyncSession = Depends(get_db),
) -> ExpenseService:
    """Create an expense service."""
    return ExpenseService(session)


def get_attachment_service(
    session: AsyncSession = Depends(get_db),
) -> AttachmentService:
    """Create an attachment service."""
    return AttachmentService(session)


def get_receipt_ocr_service() -> ReceiptOCRService:
    """Return the process-wide local OCR adapter and cached model pipeline."""
    return receipt_ocr_service


def get_dashboard_service(
    session: AsyncSession = Depends(get_db),
) -> DashboardService:
    """Create a dashboard service."""
    return DashboardService(session)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    service: AuthService = Depends(get_auth_service),
) -> Member:
    """Dependency to retrieve and validate the current authenticated user."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return await service.get_current_user(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def require_role(*allowed_roles: Role):
    """Factory dependency for role-based authorization check."""
    def role_checker(current_user: Member = Depends(get_current_user)) -> Member:
        user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        allowed_str = [r.value if hasattr(r, "value") else str(r) for r in allowed_roles]

        if user_role.upper() not in [r.upper() for r in allowed_str]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Insufficient permissions for role '{user_role}'",
            )
        return current_user

    return role_checker


def require_treasurer(
    current_user: Member = Depends(require_role(Role.TREASURER, Role.ADMIN, Role.SUPERADMIN)),
) -> Member:
    """Require Treasurer, Admin, or Superadmin privileges."""
    return current_user


def require_admin(
    current_user: Member = Depends(require_role(Role.ADMIN, Role.SUPERADMIN)),
) -> Member:
    """Require Admin or Superadmin privileges."""
    return current_user


def require_superadmin(
    current_user: Member = Depends(require_role(Role.SUPERADMIN)),
) -> Member:
    """Require platform-wide Superadmin privileges."""
    return current_user


def get_scope_organization_id(
    current_user: Member = Depends(get_current_user),
) -> uuid.UUID | None:
    """Return the organization a request should be scoped to.

    Superadmins are not confined to a single organization: this returns
    None for them, which every scoped repository/service method treats as
    "no organization filter". Every other role is scoped to their own
    organization_id, exactly as before.
    """
    if current_user.role == Role.SUPERADMIN:
        return None
    return current_user.organization_id


def get_scope_member_id(
    current_user: Member = Depends(get_current_user),
) -> uuid.UUID | None:
    """Restrict member-level expense resources to the signed-in member."""
    user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    return current_user.id if user_role.upper() == Role.MEMBER.value else None


def translate_service_exception(exc: Exception) -> NoReturn:
    """Translate service-layer failures into HTTP exceptions."""
    if isinstance(exc, StorageOperationError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    if isinstance(exc, ValueError):
        detail = str(exc)
        if "invalid" in detail.lower() and ("password" in detail.lower() or "token" in detail.lower() or "credentials" in detail.lower()):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail) from exc
        status_code = (
            status.HTTP_404_NOT_FOUND
            if "not found" in detail.lower()
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc

    if isinstance(exc, RuntimeError):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    if isinstance(exc, IntegrityError):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Request conflicts with existing data.",
        ) from exc

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error.",
    ) from exc
