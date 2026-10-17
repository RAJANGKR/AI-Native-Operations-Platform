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
    from app.models.organization import Organization


class Event(BaseModel):
    __tablename__ = "events"

    # Every event belongs to an organization (club) directly, regardless of
    # whether it also belongs to a specific chapter. This is what makes
    # club-wide events (e.g. an annual flagship event with no owning
    # chapter) possible: chapter_id is optional, organization_id is not.
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        index=True,
        nullable=False,
    )

    chapter_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chapters.id"),
        index=True,
        nullable=True,
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

    organization: Mapped["Organization"] = relationship()

    chapter: Mapped["Chapter | None"] = relationship(
        back_populates="events",
    )

    expense_reports: Mapped[list["ExpenseReport"]] = relationship(
        back_populates="event",
    )

    @property
    def title(self) -> str:
        return self.name
