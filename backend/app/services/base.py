from collections.abc import Awaitable, Callable
from typing import Any, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession

InstanceT = TypeVar("InstanceT")


class BaseService:
    """Base service with shared transaction helpers."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def commit(self) -> None:
        """Commit the current transaction."""
        await self.session.commit()

    async def rollback(self) -> None:
        """Rollback the current transaction."""
        await self.session.rollback()

    async def flush(self) -> None:
        """Flush pending changes."""
        await self.session.flush()

    async def refresh(self, instance: Any) -> None:
        """Refresh an ORM instance from the database."""
        await self.session.refresh(instance)

    async def _run_in_transaction(
        self, operation: Callable[[], Awaitable[InstanceT]]
    ) -> InstanceT:
        """Run a write operation and rollback on unexpected failures."""
        try:
            result = await operation()
            await self.commit()
            return result
        except (ValueError, RuntimeError):
            await self.rollback()
            raise
        except Exception:
            await self.rollback()
            raise
