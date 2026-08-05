import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.attachment import AttachmentType
from app.models.attachment import Attachment
from app.repositories.base import BaseRepository


class AttachmentRepository(BaseRepository[Attachment]):
    """Database access methods for attachments."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session=session, model=Attachment)

    async def get_by_expense(self, expense_id: uuid.UUID) -> list[Attachment]:
        """Return all attachments for an expense."""
        statement = select(Attachment).where(Attachment.expense_id == expense_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def get_by_type(self, attachment_type: AttachmentType) -> list[Attachment]:
        """Return all attachments of a given type."""
        statement = select(Attachment).where(Attachment.type == attachment_type)
        result = await self.session.execute(statement)
        return list(result.scalars().all())
