import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.expense_report import ExpenseReportStatus
from app.models.chapter import Chapter
from app.models.expense_report import ExpenseReport
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
        """Create a new expense report after validating its hierarchy.

        A report tied to a club-wide event (one with no chapter) is filed
        under that organization's auto-provisioned general chapter, resolved
        here rather than left to the caller.
        """
        await self._resolve_chapter_for_club_wide_event(data)

        await self._validate_report_hierarchy(
            organization_id=data.get("organization_id"),
            chapter_id=data.get("chapter_id"),
            event_id=data.get("event_id"),
        )

        return await self._run_in_transaction(
            lambda: self.expense_report_repository.create(**data)
        )

    async def get_report(
        self, report_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> ExpenseReport | None:
        """Return an expense report by id, scoped to the caller's organization."""
        report = await self.expense_report_repository.get_by_id(report_id)
        if report is None:
            return None
        if organization_id is not None and report.organization_id != organization_id:
            return None
        return report

    async def get_all_reports(
        self, organization_id: uuid.UUID | None
    ) -> list[ExpenseReport]:
        """Return all expense reports for the caller's organization."""
        return await self.expense_report_repository.get_reports_by_organization(organization_id)

    async def update_report(
        self, report_id: uuid.UUID, organization_id: uuid.UUID | None, **data: Any
    ) -> ExpenseReport:
        """Update an existing expense report, scoped to the caller's organization."""
        report = await self._get_scoped_report(report_id, organization_id)

        if "event_id" in data and "chapter_id" not in data:
            await self._resolve_chapter_for_club_wide_event(data)

        chapter_id = data.get("chapter_id", report.chapter_id)
        event_id = data.get("event_id", report.event_id)
        await self._validate_report_hierarchy(
            organization_id=report.organization_id,
            chapter_id=chapter_id,
            event_id=event_id,
        )

        return await self._run_in_transaction(
            lambda: self.expense_report_repository.update(report, **data)
        )

    async def delete_report(
        self, report_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> None:
        """Delete an expense report by id, scoped to the caller's organization."""
        report = await self._get_scoped_report(report_id, organization_id)

        await self._run_in_transaction(lambda: self._delete_report_instance(report))

    async def submit_report(
        self, report_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> ExpenseReport:
        """Submit a draft expense report that contains at least one expense."""
        report = await self._get_scoped_report(report_id, organization_id)

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

    async def _get_scoped_report(
        self, report_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> ExpenseReport:
        """Fetch a report and verify it belongs to the given organization."""
        report = await self.expense_report_repository.get_by_id(report_id)
        if report is None:
            raise ValueError("Expense report not found")
        if organization_id is not None and report.organization_id != organization_id:
            raise ValueError("Expense report not found")
        return report

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

        if event.organization_id != organization.id:
            raise RuntimeError("Event does not belong to the specified organization")

        if event.chapter_id is None:
            if not chapter.is_general:
                raise RuntimeError(
                    "Reports for club-wide events must be filed under the "
                    "organization's general chapter"
                )
        elif event.chapter_id != chapter.id:
            raise RuntimeError("Event does not belong to the specified chapter")

    async def _resolve_chapter_for_club_wide_event(self, data: dict[str, Any]) -> None:
        """If chapter_id wasn't supplied but event_id was, fill chapter_id
        in from the event: its own chapter if it has one, otherwise the
        organization's auto-provisioned general chapter (club-wide event)."""
        event_id = data.get("event_id")
        if event_id is None or data.get("chapter_id"):
            return

        event = await self.event_repository.get_by_id(event_id)
        if event is None:
            return

        if event.chapter_id is not None:
            data["chapter_id"] = event.chapter_id
            return

        general_chapter = await self._get_or_create_general_chapter(event.organization_id)
        data["chapter_id"] = general_chapter.id

    async def _get_or_create_general_chapter(self, organization_id: uuid.UUID) -> Chapter:
        """Fetch the organization's auto-provisioned catch-all chapter,
        creating it on first use."""
        chapter = await self.chapter_repository.get_general_chapter(organization_id)
        if chapter is not None:
            return chapter

        return await self._run_in_transaction(
            lambda: self.chapter_repository.create(
                organization_id=organization_id,
                name="General",
                is_general=True,
            )
        )
