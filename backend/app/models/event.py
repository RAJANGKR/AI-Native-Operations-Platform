import uuid
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_model import BaseModel
from app.enums.event import EventStatus

if TYPE_CHECKING:
    from app.models.chapter import Chapter
    from app.models.expense_report import ExpenseReport


class Event(BaseModel):
    __tablename__ = "events"

    chapter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chapters.id"),
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

    budget: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        default=Decimal("0.00"),
        nullable=False,
    )

    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    status: Mapped[EventStatus] = mapped_column(
        Enum(EventStatus),
        default=EventStatus.PLANNED,
        nullable=False,
    )

    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )

    chapter: Mapped["Chapter"] = relationship(
        back_populates="events",
    )

    expense_reports: Mapped[list["ExpenseReport"]] = relationship(
        back_populates="event",
    )

    @property
    def title(self) -> str:
        return self.name
