import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.member import Member
from app.repositories.base import BaseRepository


class MemberRepository(BaseRepository[Member]):
    """Database access methods for members."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session=session, model=Member)

    async def get_by_email(self, email: str) -> Member | None:
        """Return a member by email address."""
        statement = select(Member).where(Member.email == email)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_organization(self, organization_id: uuid.UUID | None) -> list[Member]:
        """Return all members for an organization, or every member if None."""
        statement = select(Member)
        if organization_id is not None:
            statement = statement.where(Member.organization_id == organization_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_user_by_email(self, email: str) -> Member | None:
        """Alias for get_by_email."""
        return await self.get_by_email(email)
