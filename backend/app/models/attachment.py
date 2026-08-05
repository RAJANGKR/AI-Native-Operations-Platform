import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_model import BaseModel
from app.enums.attachment import AttachmentType, OCRStatus

if TYPE_CHECKING:
    from app.models.expense import Expense


class Attachment(BaseModel):
    __tablename__ = "attachments"

    expense_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("expenses.id"),
        index=True,
        nullable=False,
    )

    type: Mapped[AttachmentType] = mapped_column(
        Enum(AttachmentType),
        nullable=False,
    )

    storage_path: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    ocr_status: Mapped[OCRStatus] = mapped_column(
        Enum(OCRStatus),
        default=OCRStatus.PENDING,
        nullable=False,
    )

    ocr_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    expense: Mapped["Expense"] = relationship(
        back_populates="attachments",
    )
