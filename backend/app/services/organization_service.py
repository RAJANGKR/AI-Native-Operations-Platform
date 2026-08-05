import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

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
        """Delete an organization by id."""
        organization = await self.organization_repository.get_by_id(organization_id)
        if organization is None:
            raise ValueError("Organization not found")

        await self._run_in_transaction(
            lambda: self._delete_organization_instance(organization)
        )

    async def _delete_organization_instance(self, organization: Organization) -> None:
        await self.organization_repository.delete(organization)
