import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attachment import Attachment
from app.repositories.attachment_repository import AttachmentRepository
from app.repositories.expense_repository import ExpenseRepository
from app.services.base import BaseService


class AttachmentService(BaseService):
    """Service layer for attachment use cases."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.attachment_repository = AttachmentRepository(session)
        self.expense_repository = ExpenseRepository(session)

    async def create_attachment(self, **data: Any) -> Attachment:
        """Create an attachment for an existing expense."""
        expense_id = data.get("expense_id")
        if expense_id is None:
            raise ValueError("expense_id is required")

        expense = await self.expense_repository.get_by_id(expense_id)
        if expense is None:
            raise ValueError("Expense not found")

        return await self._run_in_transaction(
            lambda: self.attachment_repository.create(**data)
        )

    async def get_attachment(self, attachment_id: uuid.UUID) -> Attachment | None:
        """Return an attachment by id."""
        return await self.attachment_repository.get_by_id(attachment_id)

    async def delete_attachment(self, attachment_id: uuid.UUID) -> None:
        """Delete an attachment by id."""
        attachment = await self.attachment_repository.get_by_id(attachment_id)
        if attachment is None:
            raise ValueError("Attachment not found")

        await self._run_in_transaction(
            lambda: self._delete_attachment_instance(attachment)
        )

    async def get_attachments_for_expense(
        self, expense_id: uuid.UUID
    ) -> list[Attachment]:
        """Return all attachments for an expense."""
        return await self.attachment_repository.get_by_expense(expense_id)

    async def _delete_attachment_instance(self, attachment: Attachment) -> None:
        await self.attachment_repository.delete(attachment)
