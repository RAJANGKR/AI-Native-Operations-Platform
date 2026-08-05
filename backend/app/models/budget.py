import uuid
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_model import BaseModel
from app.enums.budget import BudgetPeriod, BudgetStatus

if TYPE_CHECKING:
    from app.models.expense import Expense
    from app.models.organization import Organization


class Budget(BaseModel):
    __tablename__ = "budgets"

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

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    period: Mapped[BudgetPeriod] = mapped_column(
        Enum(BudgetPeriod),
        nullable=False,
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    status: Mapped[BudgetStatus] = mapped_column(
        Enum(BudgetStatus),
        default=BudgetStatus.DRAFT,
        nullable=False,
    )

    organization: Mapped["Organization"] = relationship(
        back_populates="budgets",
    )

    expenses: Mapped[list["Expense"]] = relationship(
        back_populates="budget",
    )
