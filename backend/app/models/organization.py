from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.budget import Budget
    from app.models.chapter import Chapter
    from app.models.member import Member
    from app.models.expense import Expense


class Organization(BaseModel):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    industry: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    currency: Mapped[str] = mapped_column(
        String(10),
        default="INR",
        nullable=False,
    )

    members: Mapped[list["Member"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )

    budgets: Mapped[list["Budget"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )

    chapters: Mapped[list["Chapter"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )

    expenses: Mapped[list["Expense"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
