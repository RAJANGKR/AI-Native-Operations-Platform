import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.budget import BudgetStatus
from app.models.budget import Budget
from app.repositories.base import BaseRepository


class BudgetRepository(BaseRepository[Budget]):
    """Database access methods for budgets."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session=session, model=Budget)

    async def get_active_budgets(self) -> list[Budget]:
        """Return budgets currently marked active."""
        statement = select(Budget).where(Budget.status == BudgetStatus.ACTIVE)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_by_organization(self, organization_id: uuid.UUID) -> list[Budget]:
        """Return all budgets for an organization."""
        statement = select(Budget).where(Budget.organization_id == organization_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())
