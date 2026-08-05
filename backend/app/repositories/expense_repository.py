import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.expense import Expense
from app.repositories.base import BaseRepository


class ExpenseRepository(BaseRepository[Expense]):
    """Database access methods for expenses."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session=session, model=Expense)

    async def get_by_report(self, report_id: uuid.UUID) -> list[Expense]:
        """Return all expenses for an expense report."""
        statement = select(Expense).where(Expense.report_id == report_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_by_budget(self, budget_id: uuid.UUID) -> list[Expense]:
        """Return all expenses linked to a budget."""
        statement = select(Expense).where(Expense.budget_id == budget_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_by_date_range(
        self, start_date: date, end_date: date
    ) -> list[Expense]:
        """Return all expenses within an inclusive date range."""
        statement = select(Expense).where(
            Expense.expense_date >= start_date,
            Expense.expense_date <= end_date,
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())
