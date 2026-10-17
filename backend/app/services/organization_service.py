import uuid
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attachment import Attachment
from app.models.budget import Budget
from app.models.chapter import Chapter
from app.models.event import Event
from app.models.expense import Expense
from app.models.expense_report import ExpenseReport
from app.models.member import Member
from app.models.organization import Organization
from app.repositories.organization_repository import OrganizationRepository
from app.services.base import BaseService


class OrganizationService(BaseService):
    """Service layer for organization use cases."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.organization_repository = OrganizationRepository(session)

    async def create_organization(self, **data: Any) -> Organization:
        """Create a new organization."""
        return await self._run_in_transaction(
            lambda: self.organization_repository.create(**data)
        )

    async def get_organization(self, organization_id: uuid.UUID) -> Organization | None:
        """Return an organization by id."""
        return await self.organization_repository.get_by_id(organization_id)

    async def get_all_organizations(self) -> list[Organization]:
        """Return all registered clubs/organizations."""
        return await self.organization_repository.get_all()

    async def update_organization(
        self, organization_id: uuid.UUID, **data: Any
    ) -> Organization:
        """Update an existing organization."""
        organization = await self.organization_repository.get_by_id(organization_id)
        if organization is None:
            raise ValueError("Organization not found")

        return await self._run_in_transaction(
            lambda: self.organization_repository.update(organization, **data)
        )

    async def delete_organization(self, organization_id: uuid.UUID) -> None:
        """Delete an organization and everything under it.

        Deletes via explicit, dependency-ordered bulk DELETE statements
        rather than relying on ORM cascade + eager loading: the ORM cascade
        graph is several relationships deep (Organization -> Chapter ->
        Event, Organization -> ExpenseReport -> Expense -> Attachment) and
        any relationship left un-preloaded triggers a synchronous lazy load
        that the async driver can't service (MissingGreenlet). Bulk deletes
        never touch Python-side relationship attributes, so this class of
        bug can't recur here.
        """
        organization = await self.organization_repository.get_by_id(organization_id)
        if organization is None:
            raise ValueError("Organization not found")

        report_ids_subq = select(ExpenseReport.id).where(
            ExpenseReport.organization_id == organization_id
        )
        expense_ids_subq = select(Expense.id).where(Expense.report_id.in_(report_ids_subq))
        chapter_ids_subq = select(Chapter.id).where(Chapter.organization_id == organization_id)

        try:
            await self.session.execute(
                delete(Attachment).where(Attachment.expense_id.in_(expense_ids_subq))
            )
            await self.session.execute(
                delete(Expense).where(Expense.id.in_(expense_ids_subq))
            )
            await self.session.execute(
                delete(ExpenseReport).where(ExpenseReport.organization_id == organization_id)
            )
            await self.session.execute(
                delete(Event).where(Event.chapter_id.in_(chapter_ids_subq))
            )
            await self.session.execute(
                delete(Budget).where(Budget.organization_id == organization_id)
            )
            await self.session.execute(
                delete(Chapter).where(Chapter.organization_id == organization_id)
            )
            await self.session.execute(
                delete(Member).where(Member.organization_id == organization_id)
            )
            await self.session.execute(
                delete(Organization).where(Organization.id == organization_id)
            )
            await self.commit()
        except Exception:
            await self.rollback()
            raise
