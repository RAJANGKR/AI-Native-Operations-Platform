import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.expense_report import ExpenseReportStatus
from app.models.expense import Expense
from app.repositories.expense_report_repository import ExpenseReportRepository
from app.repositories.expense_repository import ExpenseRepository
from app.services.base import BaseService


class ExpenseService(BaseService):
    """Service layer for expense use cases."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.expense_repository = ExpenseRepository(session)
        self.expense_report_repository = ExpenseReportRepository(session)

    async def create_expense(self, **data: Any) -> Expense:
        """Create an expense for a draft expense report."""
        report_id = data.get("report_id")
        if report_id is None:
            raise ValueError("report_id is required")

        report = await self.expense_report_repository.get_by_id(report_id)
        if report is None:
            raise ValueError("Expense report not found")

        if report.status != ExpenseReportStatus.DRAFT:
            raise RuntimeError("Expenses can only be added to draft reports")

        return await self._run_in_transaction(lambda: self.expense_repository.create(**data))

    async def get_expense(self, expense_id: uuid.UUID) -> Expense | None:
        """Return an expense by id."""
        return await self.expense_repository.get_by_id(expense_id)

    async def update_expense(self, expense_id: uuid.UUID, **data: Any) -> Expense:
        """Update an existing expense."""
        expense = await self.expense_repository.get_by_id(expense_id)
        if expense is None:
            raise ValueError("Expense not found")

        return await self._run_in_transaction(
            lambda: self.expense_repository.update(expense, **data)
        )

    async def delete_expense(self, expense_id: uuid.UUID) -> None:
        """Delete an expense by id."""
        expense = await self.expense_repository.get_by_id(expense_id)
        if expense is None:
            raise ValueError("Expense not found")

        await self._run_in_transaction(lambda: self._delete_expense_instance(expense))

    async def get_expenses_for_report(self, report_id: uuid.UUID) -> list[Expense]:
        """Return all expenses for a report."""
        return await self.expense_repository.get_by_report(report_id)

    async def _delete_expense_instance(self, expense: Expense) -> None:
        await self.expense_repository.delete(expense)
