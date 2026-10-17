import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.expense_report import ExpenseReportStatus
from app.models.expense import Expense
from app.models.expense_report import ExpenseReport
from app.repositories.expense_report_repository import ExpenseReportRepository
from app.repositories.expense_repository import ExpenseRepository
from app.services.base import BaseService


class ExpenseService(BaseService):
    """Service layer for expense use cases."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.expense_repository = ExpenseRepository(session)
        self.expense_report_repository = ExpenseReportRepository(session)

    async def create_expense(
        self,
        organization_id: uuid.UUID | None,
        member_id: uuid.UUID | None = None,
        **data: Any,
    ) -> Expense:
        """Create an expense for a draft expense report in the caller's organization."""
        report_id = data.get("report_id")
        if report_id is None:
            raise ValueError("report_id is required")

        report = await self._get_scoped_report(report_id, organization_id, member_id)

        if report.status != ExpenseReportStatus.DRAFT:
            raise RuntimeError("Expenses can only be added to draft reports")

        return await self._run_in_transaction(lambda: self.expense_repository.create(**data))

    async def get_expense(
        self,
        expense_id: uuid.UUID,
        organization_id: uuid.UUID | None,
        member_id: uuid.UUID | None = None,
    ) -> Expense | None:
        """Return an expense by id, scoped to the caller's organization."""
        expense = await self.expense_repository.get_by_id(expense_id)
        if expense is None:
            return None
        if organization_id is None and member_id is None:
            return expense
        report = await self.expense_report_repository.get_by_id(expense.report_id)
        if (
            report is None
            or (organization_id is not None and report.organization_id != organization_id)
            or (member_id is not None and report.member_id != member_id)
        ):
            return None
        return expense

    async def update_expense(
        self,
        expense_id: uuid.UUID,
        organization_id: uuid.UUID | None,
        member_id: uuid.UUID | None = None,
        **data: Any,
    ) -> Expense:
        """Update an existing expense, scoped to the caller's organization."""
        expense = await self._get_scoped_expense(expense_id, organization_id, member_id)

        return await self._run_in_transaction(
            lambda: self.expense_repository.update(expense, **data)
        )

    async def delete_expense(
        self,
        expense_id: uuid.UUID,
        organization_id: uuid.UUID | None,
        member_id: uuid.UUID | None = None,
    ) -> None:
        """Delete an expense by id, scoped to the caller's organization."""
        expense = await self._get_scoped_expense(expense_id, organization_id, member_id)

        await self._run_in_transaction(lambda: self._delete_expense_instance(expense))

    async def get_expenses_for_report(
        self,
        report_id: uuid.UUID,
        organization_id: uuid.UUID | None,
        member_id: uuid.UUID | None = None,
    ) -> list[Expense]:
        """Return all expenses for a report the caller's organization owns."""
        await self._get_scoped_report(report_id, organization_id, member_id)
        return await self.expense_repository.get_by_report(report_id)

    async def get_all_expenses(
        self, organization_id: uuid.UUID | None, member_id: uuid.UUID | None = None
    ) -> list[Expense]:
        """Return expenses for the caller's organization, optionally restricted
        to reports owned by a specific member."""
        return await self.expense_repository.get_by_organization(organization_id, member_id)

    async def _delete_expense_instance(self, expense: Expense) -> None:
        await self.expense_repository.delete(expense)

    async def _get_scoped_report(
        self,
        report_id: uuid.UUID,
        organization_id: uuid.UUID | None,
        member_id: uuid.UUID | None = None,
    ) -> ExpenseReport:
        """Fetch a report and verify it belongs to the given organization."""
        report = await self.expense_report_repository.get_by_id(report_id)
        if report is None:
            raise ValueError("Expense report not found")
        if organization_id is not None and report.organization_id != organization_id:
            raise ValueError("Expense report not found")
        if member_id is not None and report.member_id != member_id:
            raise ValueError("Expense report not found")
        return report

    async def _get_scoped_expense(
        self,
        expense_id: uuid.UUID,
        organization_id: uuid.UUID | None,
        member_id: uuid.UUID | None = None,
    ) -> Expense:
        """Fetch an expense and verify its report belongs to the given organization."""
        expense = await self.expense_repository.get_by_id(expense_id)
        if expense is None:
            raise ValueError("Expense not found")
        await self._get_scoped_report(expense.report_id, organization_id, member_id)
        return expense
