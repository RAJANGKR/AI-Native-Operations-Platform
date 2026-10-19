import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.expense import Expense
from app.models.expense_report import ExpenseReport
from app.repositories.base import BaseRepository


class ExpenseRepository(BaseRepository[Expense]):
    """Database access methods for expenses."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session=session, model=Expense)

    async def get_by_id(self, model_id: uuid.UUID) -> Expense | None:
        """Fetch one expense with attachments ready for async-safe serialization."""
        statement = (
            select(Expense)
            .options(selectinload(Expense.attachments))
            .where(Expense.id == model_id)
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_organization(
        self, organization_id: uuid.UUID | None, member_id: uuid.UUID | None = None
    ) -> list[Expense]:
        """Return expenses whose report belongs to an organization (or every
        expense if None), optionally further restricted to reports owned by
        a specific member."""
        statement = (
            select(Expense)
            .options(selectinload(Expense.attachments))
            .join(ExpenseReport, Expense.report_id == ExpenseReport.id)
        )
        if organization_id is not None:
            statement = statement.where(ExpenseReport.organization_id == organization_id)
        if member_id is not None:
            statement = statement.where(ExpenseReport.member_id == member_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_by_report(self, report_id: uuid.UUID) -> list[Expense]:
        """Return all expenses for an expense report."""
        statement = (
            select(Expense)
            .options(selectinload(Expense.attachments))
            .where(Expense.report_id == report_id)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_by_budget(self, budget_id: uuid.UUID) -> list[Expense]:
        """Return all expenses linked to a budget."""
        statement = (
            select(Expense)
            .options(selectinload(Expense.attachments))
            .where(Expense.budget_id == budget_id)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_by_date_range(
        self, start_date: date, end_date: date
    ) -> list[Expense]:
        """Return all expenses within an inclusive date range."""
        statement = select(Expense).where(
            Expense.expense_date >= start_date,
            Expense.expense_date <= end_date,
        ).options(selectinload(Expense.attachments))
        result = await self.session.execute(statement)
        return list(result.scalars().all())
