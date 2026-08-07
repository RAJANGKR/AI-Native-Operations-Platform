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
    """Repository executing raw database aggregation queries for dashboard."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_total_spending(self) -> Decimal:
        """Query sum of all expense amounts."""
        statement = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00")))
        result = await self.session.execute(statement)
        val = result.scalar_one_or_none()
        return Decimal(str(val)) if val is not None else Decimal("0.00")

    async def get_total_budget(self) -> Decimal:
        """Query sum of all budget amounts."""
        statement = select(func.coalesce(func.sum(Budget.amount), Decimal("0.00")))
        result = await self.session.execute(statement)
        val = result.scalar_one_or_none()
        return Decimal(str(val)) if val is not None else Decimal("0.00")

    async def get_active_events_count(self) -> int:
        """Query total active or planned events count."""
        statement = select(func.count(Event.id)).where(
            Event.status.in_([EventStatus.PLANNED, EventStatus.ACTIVE])
        )
        result = await self.session.execute(statement)
        val = result.scalar_one_or_none()
        return int(val) if val is not None else 0

    async def get_pending_approvals_count(self) -> int:
        """Query count of expense reports submitted for approval."""
        statement = select(func.count(ExpenseReport.id)).where(
            ExpenseReport.status == ExpenseReportStatus.SUBMITTED
        )
        result = await self.session.execute(statement)
        val = result.scalar_one_or_none()
        return int(val) if val is not None else 0

    async def get_total_members_count(self) -> int:
        """Query total registered members count."""
        statement = select(func.count(Member.id))
        result = await self.session.execute(statement)
        val = result.scalar_one_or_none()
        return int(val) if val is not None else 0

    async def get_monthly_spending(self) -> list[tuple[int, int, Decimal]]:
        """Query monthly spending grouped by year and month."""
        yr_col = extract("year", Expense.expense_date)
        mon_col = extract("month", Expense.expense_date)
        statement = (
            select(
                yr_col.label("year"),
                mon_col.label("month"),
                func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total"),
            )
            .group_by(yr_col, mon_col)
            .order_by(yr_col, mon_col)
        )
        result = await self.session.execute(statement)
        rows = result.all()
        return [
            (int(row.year), int(row.month), Decimal(str(row.total)))
            for row in rows
            if row.year is not None and row.month is not None
        ]

    async def get_category_spending(self) -> list[tuple[ExpenseCategory, Decimal]]:
        """Query total spending grouped by expense category."""
        statement = (
            select(
                Expense.category,
                func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total"),
            )
            .group_by(Expense.category)
            .order_by(func.sum(Expense.amount).desc())
        )
        result = await self.session.execute(statement)
        rows = result.all()
        return [(row[0], Decimal(str(row[1]))) for row in rows if row[0] is not None]

    async def get_top_events(self, limit: int = 5) -> list[dict[str, Any]]:
        """Query top events sorted by total expenses."""
        statement = (
            select(
                Event.id,
                Event.name,
                Event.start_date,
                Event.status,
                Chapter.name.label("chapter_name"),
                func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total_spending"),
            )
            .outerjoin(Chapter, Event.chapter_id == Chapter.id)
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

    async def get_recent_reports(self, limit: int = 5) -> list[dict[str, Any]]:
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

    async def get_recent_expenses(self, limit: int = 5) -> list[Expense]:
        """Query recent individual expense items."""
        statement = (
            select(Expense)
            .order_by(Expense.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())
