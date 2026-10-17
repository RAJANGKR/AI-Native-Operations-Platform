import uuid
from decimal import Decimal
from typing import Any

from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.event import EventStatus
from app.enums.expense import ExpenseCategory
from app.enums.expense_report import ExpenseReportStatus
from app.models.budget import Budget
from app.models.chapter import Chapter
from app.models.event import Event
from app.models.expense import Expense
from app.models.expense_report import ExpenseReport
from app.models.member import Member


class DashboardRepository:
    """Repository executing raw database aggregation queries for dashboard,
    scoped to a single organization unless organization_id is None (platform-
    wide view, for superadmins)."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_total_spending(self, organization_id: uuid.UUID | None) -> Decimal:
        """Query sum of expense amounts for the organization."""
        statement = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).join(
            ExpenseReport, Expense.report_id == ExpenseReport.id
        )
        if organization_id is not None:
            statement = statement.where(ExpenseReport.organization_id == organization_id)
        result = await self.session.execute(statement)
        val = result.scalar_one_or_none()
        return Decimal(str(val)) if val is not None else Decimal("0.00")

    async def get_total_budget(self, organization_id: uuid.UUID | None) -> Decimal:
        """Query sum of budget amounts for the organization."""
        statement = select(func.coalesce(func.sum(Budget.amount), Decimal("0.00")))
        if organization_id is not None:
            statement = statement.where(Budget.organization_id == organization_id)
        result = await self.session.execute(statement)
        val = result.scalar_one_or_none()
        return Decimal(str(val)) if val is not None else Decimal("0.00")

    async def get_active_events_count(self, organization_id: uuid.UUID | None) -> int:
        """Query total active or planned events count for the organization."""
        statement = (
            select(func.count(Event.id))
            .join(Chapter, Event.chapter_id == Chapter.id)
            .where(Event.status.in_([EventStatus.PLANNED, EventStatus.ACTIVE]))
        )
        if organization_id is not None:
            statement = statement.where(Chapter.organization_id == organization_id)
        result = await self.session.execute(statement)
        val = result.scalar_one_or_none()
        return int(val) if val is not None else 0

    async def get_pending_approvals_count(self, organization_id: uuid.UUID | None) -> int:
        """Query count of expense reports submitted for approval in the organization."""
        statement = select(func.count(ExpenseReport.id)).where(
            ExpenseReport.status == ExpenseReportStatus.SUBMITTED
        )
        if organization_id is not None:
            statement = statement.where(ExpenseReport.organization_id == organization_id)
        result = await self.session.execute(statement)
        val = result.scalar_one_or_none()
        return int(val) if val is not None else 0

    async def get_total_members_count(self, organization_id: uuid.UUID | None) -> int:
        """Query total registered members count for the organization."""
        statement = select(func.count(Member.id))
        if organization_id is not None:
            statement = statement.where(Member.organization_id == organization_id)
        result = await self.session.execute(statement)
        val = result.scalar_one_or_none()
        return int(val) if val is not None else 0

    async def get_monthly_spending(
        self, organization_id: uuid.UUID | None
    ) -> list[tuple[int, int, Decimal]]:
        """Query monthly spending grouped by year and month for the organization."""
        yr_col = extract("year", Expense.expense_date)
        mon_col = extract("month", Expense.expense_date)
        statement = (
            select(
                yr_col.label("year"),
                mon_col.label("month"),
                func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total"),
            )
            .join(ExpenseReport, Expense.report_id == ExpenseReport.id)
            .group_by(yr_col, mon_col)
            .order_by(yr_col, mon_col)
        )
        if organization_id is not None:
            statement = statement.where(ExpenseReport.organization_id == organization_id)
        result = await self.session.execute(statement)
        rows = result.all()
        return [
            (int(row.year), int(row.month), Decimal(str(row.total)))
            for row in rows
            if row.year is not None and row.month is not None
        ]

    async def get_category_spending(
        self, organization_id: uuid.UUID | None
    ) -> list[tuple[ExpenseCategory, Decimal]]:
        """Query total spending grouped by expense category for the organization."""
        statement = (
            select(
                Expense.category,
                func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total"),
            )
            .join(ExpenseReport, Expense.report_id == ExpenseReport.id)
            .group_by(Expense.category)
            .order_by(func.sum(Expense.amount).desc())
        )
        if organization_id is not None:
            statement = statement.where(ExpenseReport.organization_id == organization_id)
        result = await self.session.execute(statement)
        rows = result.all()
        return [(row[0], Decimal(str(row[1]))) for row in rows if row[0] is not None]

    async def get_top_events(
        self, organization_id: uuid.UUID | None, limit: int = 5
    ) -> list[dict[str, Any]]:
        """Query top events sorted by total expenses for the organization."""
        statement = (
            select(
                Event.id,
                Event.name,
                Event.start_date,
                Event.status,
                Chapter.name.label("chapter_name"),
                func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total_spending"),
            )
            .join(Chapter, Event.chapter_id == Chapter.id)
            .outerjoin(ExpenseReport, ExpenseReport.event_id == Event.id)
            .outerjoin(Expense, Expense.report_id == ExpenseReport.id)
            .group_by(
                Event.id,
                Event.name,
                Event.start_date,
                Event.status,
                Event.created_at,
                Chapter.name,
            )
            .order_by(func.sum(Expense.amount).desc().nulls_last(), Event.created_at.desc())
            .limit(limit)
        )
        if organization_id is not None:
            statement = statement.where(Chapter.organization_id == organization_id)
        result = await self.session.execute(statement)
        rows = result.all()
        return [
            {
                "id": row.id,
                "name": row.name,
                "start_date": row.start_date,
                "status": row.status,
                "chapter_name": row.chapter_name,
                "total_spending": Decimal(str(row.total_spending)),
            }
            for row in rows
        ]

    async def get_recent_reports(
        self, organization_id: uuid.UUID | None, limit: int = 5
    ) -> list[dict[str, Any]]:
        """Query recent expense reports with member name and calculated total amount."""
        statement = (
            select(
                ExpenseReport.id,
                ExpenseReport.title,
                ExpenseReport.status,
                ExpenseReport.submitted_at,
                ExpenseReport.created_at,
                Member.full_name.label("member_name"),
                func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total_amount"),
            )
            .outerjoin(Member, ExpenseReport.member_id == Member.id)
            .outerjoin(Expense, Expense.report_id == ExpenseReport.id)
            .group_by(
                ExpenseReport.id,
                ExpenseReport.title,
                ExpenseReport.status,
                ExpenseReport.submitted_at,
                ExpenseReport.created_at,
                Member.full_name,
            )
            .order_by(ExpenseReport.created_at.desc())
            .limit(limit)
        )
        if organization_id is not None:
            statement = statement.where(ExpenseReport.organization_id == organization_id)
        result = await self.session.execute(statement)
        rows = result.all()
        return [
            {
                "id": row.id,
                "title": row.title,
                "status": row.status,
                "submitted_at": row.submitted_at,
                "created_at": row.created_at,
                "member_name": row.member_name,
                "total_amount": Decimal(str(row.total_amount)),
            }
            for row in rows
        ]

    async def get_recent_expenses(
        self, organization_id: uuid.UUID | None, limit: int = 5
    ) -> list[Expense]:
        """Query recent individual expense items for the organization."""
        statement = (
            select(Expense)
            .join(ExpenseReport, Expense.report_id == ExpenseReport.id)
            .order_by(Expense.created_at.desc())
            .limit(limit)
        )
        if organization_id is not None:
            statement = statement.where(ExpenseReport.organization_id == organization_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())
