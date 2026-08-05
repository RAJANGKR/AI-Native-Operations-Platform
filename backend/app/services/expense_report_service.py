import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.expense_report import ExpenseReportStatus
from app.models.expense_report import ExpenseReport
from app.repositories.expense_report_repository import ExpenseReportRepository
from app.repositories.expense_repository import ExpenseRepository
from app.services.base import BaseService


class ExpenseReportService(BaseService):
    """Service layer for expense report use cases."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.expense_report_repository = ExpenseReportRepository(session)
        self.expense_repository = ExpenseRepository(session)

    async def create_report(self, **data: Any) -> ExpenseReport:
        """Create a new expense report."""
        return await self._run_in_transaction(
            lambda: self.expense_report_repository.create(**data)
        )

    async def get_report(self, report_id: uuid.UUID) -> ExpenseReport | None:
        """Return an expense report by id."""
        return await self.expense_report_repository.get_by_id(report_id)

    async def update_report(self, report_id: uuid.UUID, **data: Any) -> ExpenseReport:
        """Update an existing expense report."""
        report = await self.expense_report_repository.get_by_id(report_id)
        if report is None:
            raise ValueError("Expense report not found")

        return await self._run_in_transaction(
            lambda: self.expense_report_repository.update(report, **data)
        )

    async def delete_report(self, report_id: uuid.UUID) -> None:
        """Delete an expense report by id."""
        report = await self.expense_report_repository.get_by_id(report_id)
        if report is None:
            raise ValueError("Expense report not found")

        await self._run_in_transaction(lambda: self._delete_report_instance(report))

    async def submit_report(self, report_id: uuid.UUID) -> ExpenseReport:
        """Submit a draft expense report that contains at least one expense."""
        report = await self.expense_report_repository.get_by_id(report_id)
        if report is None:
            raise ValueError("Expense report not found")

        if report.status != ExpenseReportStatus.DRAFT:
            raise RuntimeError("Only draft reports can be submitted")

        expenses = await self.expense_repository.get_by_report(report_id)
        if not expenses:
            raise RuntimeError("Expense report must contain at least one expense")

        async def operation() -> ExpenseReport:
            updated_report = await self.expense_report_repository.update(
                report,
                status=ExpenseReportStatus.SUBMITTED,
            )
            # TODO: approval workflow hooks belong here when introduced.
            # TODO: notification and audit log integrations belong here.
            return updated_report

        return await self._run_in_transaction(operation)

    async def _delete_report_instance(self, report: ExpenseReport) -> None:
        await self.expense_report_repository.delete(report)
