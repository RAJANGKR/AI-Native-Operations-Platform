import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.event import Event
    from app.models.expense_report import ExpenseReport
    from app.models.organization import Organization


class Chapter(BaseModel):
    __tablename__ = "chapters"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        index=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    organization: Mapped["Organization"] = relationship(
        back_populates="chapters",
    )

    events: Mapped[list["Event"]] = relationship(
        back_populates="chapter",
        cascade="all, delete-orphan",
    )

    expense_reports: Mapped[list["ExpenseReport"]] = relationship(
        back_populates="chapter",
        cascade="all, delete-orphan",
    )
