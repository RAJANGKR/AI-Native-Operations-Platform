"""add missing member profile and approval columns

Revision ID: 9c72a4e1f6b3
Revises: f6e633d7d470
Create Date: 2026-10-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9c72a4e1f6b3"
down_revision: Union[str, Sequence[str], None] = "f6e633d7d470"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add the member fields expected by the current ORM."""
    op.add_column(
        "members",
        sa.Column("department", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "members",
        sa.Column("year", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "members",
        sa.Column("approval_status", sa.String(length=50), nullable=True),
    )
    op.execute(
        sa.text(
            "UPDATE members "
            "SET approval_status = 'PENDING' "
            "WHERE approval_status IS NULL"
        )
    )
    op.alter_column(
        "members",
        "approval_status",
        existing_type=sa.String(length=50),
        nullable=False,
    )


def downgrade() -> None:
    """Prevent downgrades that would discard member data."""
    raise NotImplementedError(
        "This member schema repair is forward-only; downgrade is unsupported."
    )
