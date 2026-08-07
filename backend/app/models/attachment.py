import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
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
        default=AttachmentType.RECEIPT,
        nullable=False,
    )

    storage_path: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
    )

    original_filename: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    mime_type: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    size_bytes: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    sha256_hash: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
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
