import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.expense_report import ExpenseReportStatus
from app.models.chapter import Chapter
from app.models.expense_report import ExpenseReport
from app.models.event import Event
from app.models.organization import Organization
from app.repositories.chapter_repository import ChapterRepository
from app.repositories.event_repository import EventRepository
from app.repositories.expense_report_repository import ExpenseReportRepository
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.organization_repository import OrganizationRepository
from app.services.base import BaseService


class ExpenseReportService(BaseService):
    """Service layer for expense report use cases."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.expense_report_repository = ExpenseReportRepository(session)
        self.expense_repository = ExpenseRepository(session)
        self.organization_repository = OrganizationRepository(session)
        self.chapter_repository = ChapterRepository(session)
        self.event_repository = EventRepository(session)

    async def create_report(self, **data: Any) -> ExpenseReport:
        """Create a new expense report."""
        await self._validate_report_hierarchy(
            organization_id=data.get("organization_id"),
            chapter_id=data.get("chapter_id"),
            event_id=data.get("event_id"),
        )
        return await self._run_in_transaction(
            lambda: self.expense_report_repository.create(**data)
        )

    async def get_report(self, report_id: uuid.UUID) -> ExpenseReport | None:
        """Return an expense report by id."""
        return await self.expense_report_repository.get_by_id(report_id)

    async def get_all_reports(self) -> list[ExpenseReport]:
        """Return all expense reports."""
        return await self.expense_report_repository.get_all()

    async def update_report(self, report_id: uuid.UUID, **data: Any) -> ExpenseReport:
        """Update an existing expense report."""
        report = await self.expense_report_repository.get_by_id(report_id)
        if report is None:
            raise ValueError("Expense report not found")

        organization_id = data.get("organization_id", report.organization_id)
        chapter_id = data.get("chapter_id", report.chapter_id)
        event_id = data.get("event_id", report.event_id)
        await self._validate_report_hierarchy(
            organization_id=organization_id,
            chapter_id=chapter_id,
            event_id=event_id,
        )

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

    async def _validate_report_hierarchy(
        self,
        organization_id: uuid.UUID | None,
        chapter_id: uuid.UUID | None,
        event_id: uuid.UUID | None,
    ) -> None:
        if organization_id is None:
            raise ValueError("organization_id is required")
        if chapter_id is None:
            raise ValueError("chapter_id is required")

        organization = await self.organization_repository.get_by_id(organization_id)
        if organization is None:
            raise ValueError("Organization not found")

        chapter = await self.chapter_repository.get_by_id(chapter_id)
        if chapter is None:
            raise ValueError("Chapter not found")

        if chapter.organization_id != organization.id:
            raise RuntimeError("Chapter does not belong to the specified organization")

        if event_id is None:
            return

        event = await self.event_repository.get_by_id(event_id)
        if event is None:
            raise ValueError("Event not found")

        if event.chapter_id != chapter.id:
            raise RuntimeError("Event does not belong to the specified chapter")
