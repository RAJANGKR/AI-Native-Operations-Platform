import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_model import BaseModel
from app.enums.role import Role
from app.models.expense_report import ExpenseReport
from app.models.organization import Organization


class Member(BaseModel):
    __tablename__ = "members"

    # Nullable only for SUPERADMIN: a platform-level account isn't part of
    # any one club, so it can never become collateral damage when a club is
    # deleted. Every other role must have a real organization_id.
    organization_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=True,
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

    department: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    year: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    approval_status: Mapped[str] = mapped_column(
        String(50),
        default="APPROVED",
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    organization: Mapped["Organization | None"] = relationship(
        back_populates="members",
    )

    # Deliberately no delete cascade: a member's expense reports are financial
    # history and must survive removal of the member record. The DB foreign
    # key rejects deleting a member who still has expense reports.
    expense_reports: Mapped[list["ExpenseReport"]] = relationship(
        back_populates="member",
    )