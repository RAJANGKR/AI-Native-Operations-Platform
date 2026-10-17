"""add missing budget created_by columns and archived status to events

Revision ID: 5c33fce11b21
Revises: b5ec843e68c6
Create Date: 2026-08-19 16:22:02.769543

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5c33fce11b21'
down_revision: Union[str, Sequence[str], None] = 'b5ec843e68c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema.

    The `events` table was missing `budget` and `created_by` (present on the
    ORM model since it was first written, but never added by a migration),
    and the `eventstatus` enum was missing 'ARCHIVED' (used by
    EventService.archive_event since that method was added). Both gaps
    meant creating or archiving any event failed at the database level.
    """
    op.add_column(
        "events",
        sa.Column("budget", sa.Numeric(14, 2), nullable=False, server_default="0.00"),
    )
    op.add_column("events", sa.Column("created_by", sa.UUID(), nullable=True))
    op.execute("ALTER TYPE eventstatus ADD VALUE IF NOT EXISTS 'ARCHIVED'")


def downgrade() -> None:
    """Downgrade schema.

    Postgres cannot drop a single value from an enum type, so ARCHIVED is
    intentionally left in place on downgrade.
    """
    op.drop_column("events", "created_by")
    op.drop_column("events", "budget")
