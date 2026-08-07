import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_model import BaseModel
from app.enums.role import Role
from app.models.organization import Organization
from app.models.expense_report import ExpenseReport


class Member(BaseModel):
    __tablename__ = "members"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    hashed_password: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    role: Mapped[Role] = mapped_column(
        Enum(Role, native_enum=False, values_callable=lambda obj: [e.value for e in obj]),
        default=Role.MEMBER,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    organization: Mapped["Organization"] = relationship(
        back_populates="members",
    )

    expense_reports: Mapped[list["ExpenseReport"]] = relationship(
        back_populates="member",
        cascade="all, delete-orphan",
    )