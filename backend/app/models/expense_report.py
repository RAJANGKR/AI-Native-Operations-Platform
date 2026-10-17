import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_model import BaseModel
from app.enums.expense_report import ExpenseReportStatus

if TYPE_CHECKING:
    from app.models.chapter import Chapter
    from app.models.event import Event
    from app.models.expense import Expense
    from app.models.member import Member
    from app.models.organization import Organization


class ExpenseReport(BaseModel):
    __tablename__ = "expense_reports"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        index=True,
        nullable=False,
    )

    member_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("members.id"),
        index=True,
        nullable=False,
    )

    chapter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chapters.id"),
        index=True,
        nullable=False,
    )

    event_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("events.id"),
        index=True,
        nullable=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[ExpenseReportStatus] = mapped_column(
        Enum(ExpenseReportStatus),
        default=ExpenseReportStatus.DRAFT,
        nullable=False,
    )

    submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    organization: Mapped["Organization"] = relationship(
        back_populates="expense_reports",
    )

    member: Mapped["Member"] = relationship(
        back_populates="expense_reports",
    )

    chapter: Mapped["Chapter"] = relationship(
        back_populates="expense_reports",
    )

    event: Mapped["Event | None"] = relationship(
        back_populates="expense_reports",
    )

    expenses: Mapped[list["Expense"]] = relationship(
        back_populates="report",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
