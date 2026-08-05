"""
Generic repository for database access.

Note:
This repository intentionally does NOT call session.commit().
Transaction boundaries are managed by the Service Layer so that
multiple repository operations can participate in a single transaction.
"""


import uuid
from typing import Any, Generic, TypeVar

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Reusable async repository with generic CRUD helpers."""

    def __init__(self, session: AsyncSession, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    async def create(self, **data: Any) -> ModelT:
        """Create and persist a model instance."""
        instance = self.model(**data)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def get_by_id(self, model_id: uuid.UUID) -> ModelT | None:
        """Return a model instance by primary key."""
        statement = self._base_select().where(self.model.id == model_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_all(self) -> list[ModelT]:
        """Return all model instances."""
        result = await self.session.execute(self._base_select())
        return list(result.scalars().all())

    async def update(self, instance: ModelT, **data: Any) -> ModelT:
        """Apply field updates to an existing model instance."""
        for field, value in data.items():
            setattr(instance, field, value)

        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def delete(self, instance: ModelT) -> None:
        """Delete an existing model instance."""
        await self.session.delete(instance)
        await self.session.flush()

    async def exists(self, model_id: uuid.UUID) -> bool:
        """Check whether a model instance exists by primary key."""
        statement = self._base_select().where(self.model.id == model_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none() is not None

    def _base_select(self) -> Select[tuple[ModelT]]:
        """Return a typed select for the repository model."""
        return select(self.model)
