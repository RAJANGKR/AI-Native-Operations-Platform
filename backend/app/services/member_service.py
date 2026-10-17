import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.member import Member
from app.repositories.member_repository import MemberRepository
from app.services.base import BaseService


class MemberService(BaseService):
    """Service layer for member use cases."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.member_repository = MemberRepository(session)

    async def create_member(self, **data: Any) -> Member:
        """Create a new member."""
        return await self._run_in_transaction(lambda: self.member_repository.create(**data))

    async def get_member(
        self, member_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> Member | None:
        """Return a member by id, scoped to the caller's organization
        (organization_id=None means unscoped, for superadmins)."""
        member = await self.member_repository.get_by_id(member_id)
        if member is None:
            return None
        if organization_id is not None and member.organization_id != organization_id:
            return None
        return member

    async def update_member(
        self, member_id: uuid.UUID, organization_id: uuid.UUID | None, **data: Any
    ) -> Member:
        """Update an existing member, scoped to the caller's organization."""
        member = await self._get_scoped_member(member_id, organization_id)

        return await self._run_in_transaction(
            lambda: self.member_repository.update(member, **data)
        )

    async def delete_member(
        self, member_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> None:
        """Delete a member by id, scoped to the caller's organization."""
        member = await self._get_scoped_member(member_id, organization_id)

        await self._run_in_transaction(lambda: self._delete_member_instance(member))

    async def get_all_members(self) -> list[Member]:
        """Return all members."""
        return await self.member_repository.get_all()

    async def get_pending_members(self, organization_id: uuid.UUID | None) -> list[Member]:
        """Return members with PENDING registration status in the given organization."""
        org_members = await self.member_repository.get_by_organization(organization_id)
        return [m for m in org_members if getattr(m, "approval_status", "APPROVED") == "PENDING"]

    async def approve_member(
        self, member_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> Member:
        """Approve a pending member registration."""
        member = await self._get_scoped_member(member_id, organization_id)

        return await self._run_in_transaction(
            lambda: self.member_repository.update(member, approval_status="APPROVED", is_active=True)
        )

    async def reject_member(
        self, member_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> Member:
        """Reject a pending member registration."""
        member = await self._get_scoped_member(member_id, organization_id)

        return await self._run_in_transaction(
            lambda: self.member_repository.update(member, approval_status="REJECTED")
        )

    async def _get_scoped_member(
        self, member_id: uuid.UUID, organization_id: uuid.UUID | None
    ) -> Member:
        """Fetch a member and verify it belongs to the given organization."""
        member = await self.member_repository.get_by_id(member_id)
        if member is None:
            raise ValueError("Member not found")
        if organization_id is not None and member.organization_id != organization_id:
            raise ValueError("Member not found")
        return member

    async def get_members_by_organization(
        self, organization_id: uuid.UUID | None
    ) -> list[Member]:
        """Return members belonging to an organization (or all, if None)."""
        return await self.member_repository.get_by_organization(organization_id)

    async def _delete_member_instance(self, member: Member) -> None:
        await self.member_repository.delete(member)
