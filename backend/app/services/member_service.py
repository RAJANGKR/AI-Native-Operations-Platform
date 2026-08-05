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

    async def get_member(self, member_id: uuid.UUID) -> Member | None:
        """Return a member by id."""
        return await self.member_repository.get_by_id(member_id)

    async def update_member(self, member_id: uuid.UUID, **data: Any) -> Member:
        """Update an existing member."""
        member = await self.member_repository.get_by_id(member_id)
        if member is None:
            raise ValueError("Member not found")

        return await self._run_in_transaction(
            lambda: self.member_repository.update(member, **data)
        )

    async def delete_member(self, member_id: uuid.UUID) -> None:
        """Delete a member by id."""
        member = await self.member_repository.get_by_id(member_id)
        if member is None:
            raise ValueError("Member not found")

        await self._run_in_transaction(lambda: self._delete_member_instance(member))

    async def get_members_by_organization(
        self, organization_id: uuid.UUID
    ) -> list[Member]:
        """Return members belonging to an organization."""
        return await self.member_repository.get_by_organization(organization_id)

    async def _delete_member_instance(self, member: Member) -> None:
        await self.member_repository.delete(member)
