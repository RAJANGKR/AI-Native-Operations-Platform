import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.budget import Budget
from app.repositories.budget_repository import BudgetRepository
from app.services.base import BaseService


class BudgetService(BaseService):
    """Service layer for budget use cases."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.budget_repository = BudgetRepository(session)

    async def create_budget(self, **data: Any) -> Budget:
        """Create a new budget."""
        return await self._run_in_transaction(lambda: self.budget_repository.create(**data))

    async def get_budget(self, budget_id: uuid.UUID) -> Budget | None:
        """Return a budget by id."""
        return await self.budget_repository.get_by_id(budget_id)

    async def update_budget(self, budget_id: uuid.UUID, **data: Any) -> Budget:
        """Update an existing budget."""
        budget = await self.budget_repository.get_by_id(budget_id)
        if budget is None:
            raise ValueError("Budget not found")

        return await self._run_in_transaction(
            lambda: self.budget_repository.update(budget, **data)
        )

    async def delete_budget(self, budget_id: uuid.UUID) -> None:
        """Delete a budget by id."""
        budget = await self.budget_repository.get_by_id(budget_id)
        if budget is None:
            raise ValueError("Budget not found")

        await self._run_in_transaction(lambda: self._delete_budget_instance(budget))

    async def get_active_budgets(self) -> list[Budget]:
        """Return all active budgets."""
        return await self.budget_repository.get_active_budgets()

    async def _delete_budget_instance(self, budget: Budget) -> None:
        await self.budget_repository.delete(budget)
