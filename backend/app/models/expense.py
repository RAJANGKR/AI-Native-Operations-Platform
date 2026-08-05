import uuid
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_model import BaseModel
from app.enums.expense import ExpenseCategory, ExpenseStatus

if TYPE_CHECKING:
    from app.models.attachment import Attachment
    from app.models.budget import Budget
    from app.models.expense_report import ExpenseReport


class Expense(BaseModel):
    __tablename__ = "expenses"

    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("expense_reports.id"),
        index=True,
        nullable=False,
    )

    budget_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("budgets.id"),
        index=True,
        nullable=True,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    category: Mapped[ExpenseCategory] = mapped_column(
        Enum(ExpenseCategory),
        nullable=False,
    )

    expense_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    merchant: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[ExpenseStatus] = mapped_column(
        Enum(ExpenseStatus),
        default=ExpenseStatus.PENDING,
        nullable=False,
    )

    report: Mapped["ExpenseReport"] = relationship(
        back_populates="expenses",
    )

    budget: Mapped["Budget | None"] = relationship(
        back_populates="expenses",
    )

    attachments: Mapped[list["Attachment"]] = relationship(
        back_populates="expense",
        cascade="all, delete-orphan",
    )
