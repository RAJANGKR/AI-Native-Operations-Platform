"""support club-wide events and general chapters

Revision ID: b5ec843e68c6
Revises: b2c3d4e5f6a7
Create Date: 2026-08-19 16:07:54.538012

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b5ec843e68c6'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "chapters",
        sa.Column("is_general", sa.Boolean(), nullable=False, server_default=sa.false()),
    )

    op.add_column("events", sa.Column("organization_id", sa.UUID(), nullable=True))
    op.execute(
        """
        UPDATE events
        SET organization_id = chapters.organization_id
        FROM chapters
        WHERE events.chapter_id = chapters.id
        """
    )
    op.alter_column("events", "organization_id", nullable=False)
    op.create_foreign_key(
        "events_organization_id_fkey",
        "events",
        "organizations",
        ["organization_id"],
        ["id"],
    )
    op.create_index(
        op.f("ix_events_organization_id"), "events", ["organization_id"], unique=False
    )

    op.alter_column("events", "chapter_id", existing_type=sa.UUID(), nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column("events", "chapter_id", existing_type=sa.UUID(), nullable=False)
    op.drop_index(op.f("ix_events_organization_id"), table_name="events")
    op.drop_constraint("events_organization_id_fkey", "events", type_="foreignkey")
    op.drop_column("events", "organization_id")
    op.drop_column("chapters", "is_general")
