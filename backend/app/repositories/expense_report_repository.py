import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.expense_report import ExpenseReportStatus
from app.models.expense_report import ExpenseReport
from app.repositories.base import BaseRepository


class ExpenseReportRepository(BaseRepository[ExpenseReport]):
    """Database access methods for expense reports."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session=session, model=ExpenseReport)

    async def get_reports_by_member(self, member_id: uuid.UUID) -> list[ExpenseReport]:
        """Return all expense reports for a member."""
        statement = select(ExpenseReport).where(ExpenseReport.member_id == member_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_reports_by_organization(
        self, organization_id: uuid.UUID | None
    ) -> list[ExpenseReport]:
        """Return all expense reports for an organization, or every report if None."""
        statement = select(ExpenseReport)
        if organization_id is not None:
            statement = statement.where(ExpenseReport.organization_id == organization_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_by_status(
        self, status: ExpenseReportStatus
    ) -> list[ExpenseReport]:
        """Return all expense reports with a given status."""
        statement = select(ExpenseReport).where(ExpenseReport.status == status)
        result = await self.session.execute(statement)
        return list(result.scalars().all())
