from collections.abc import AsyncGenerator

from fastapi import Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import SessionLocal
from app.services.attachment_service import AttachmentService
from app.services.budget_service import BudgetService
from app.services.chapter_service import ChapterService
from app.services.dashboard_service import DashboardService
from app.services.event_service import EventService
from app.services.expense_report_service import ExpenseReportService
from app.services.expense_service import ExpenseService
from app.services.member_service import MemberService
from app.services.organization_service import OrganizationService


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


def get_dashboard_service(
    session: AsyncSession = Depends(get_db),
) -> DashboardService:
    """Create a dashboard service."""
    return DashboardService(session)


def translate_service_exception(exc: Exception) -> None:
    """Translate service-layer failures into HTTP exceptions."""
    if isinstance(exc, ValueError):
        detail = str(exc)
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
