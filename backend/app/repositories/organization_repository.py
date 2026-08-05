from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.repositories.base import BaseRepository


class OrganizationRepository(BaseRepository[Organization]):
    """Database access methods for organizations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session=session, model=Organization)

    async def get_by_name(self, name: str) -> Organization | None:
        """Return an organization by its name."""
        statement = select(Organization).where(Organization.name == name)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()
