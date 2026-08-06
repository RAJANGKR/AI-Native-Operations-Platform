"""add chapters and events

Revision ID: 8d3a6b12c4ef
Revises: 908915327f5b
Create Date: 2026-08-06 08:05:00.000000

"""

import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8d3a6b12c4ef"
down_revision: Union[str, Sequence[str], None] = "908915327f5b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "chapters",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_chapters_organization_id"),
        "chapters",
        ["organization_id"],
        unique=False,
    )

    op.create_table(
        "events",
        sa.Column("chapter_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "PLANNED",
                "ACTIVE",
                "COMPLETED",
                "CANCELLED",
                name="eventstatus",
            ),
            nullable=False,
        ),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_events_chapter_id"),
        "events",
        ["chapter_id"],
        unique=False,
    )

    op.add_column("expense_reports", sa.Column("chapter_id", sa.UUID(), nullable=True))
    op.add_column("expense_reports", sa.Column("event_id", sa.UUID(), nullable=True))
    op.create_index(
        op.f("ix_expense_reports_chapter_id"),
        "expense_reports",
        ["chapter_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_expense_reports_event_id"),
        "expense_reports",
        ["event_id"],
        unique=False,
    )
    op.create_foreign_key(
        op.f("expense_reports_chapter_id_fkey"),
        "expense_reports",
        "chapters",
        ["chapter_id"],
        ["id"],
    )
    op.create_foreign_key(
        op.f("expense_reports_event_id_fkey"),
        "expense_reports",
        "events",
        ["event_id"],
        ["id"],
    )

    bind = op.get_bind()
    organization_rows = bind.execute(
        sa.text(
            """
            SELECT DISTINCT organization_id
            FROM expense_reports
            WHERE organization_id IS NOT NULL
            """
        )
    ).scalars()

    for organization_id in organization_rows:
        chapter_id = uuid.uuid4()
        bind.execute(
            sa.text(
                """
                INSERT INTO chapters (
                    id,
                    organization_id,
                    name,
                    description,
                    is_active,
                    created_at,
                    updated_at
                ) VALUES (
                    :id,
                    :organization_id,
                    :name,
                    :description,
                    :is_active,
                    now(),
                    now()
                )
                """
            ),
            {
                "id": chapter_id,
                "organization_id": organization_id,
                "name": "General",
                "description": "Auto-generated default chapter for existing expense reports",
                "is_active": True,
            },
        )

    bind.execute(
        sa.text(
            """
            UPDATE expense_reports
            SET chapter_id = chapters.id
            FROM chapters
            WHERE expense_reports.organization_id = chapters.organization_id
              AND expense_reports.chapter_id IS NULL
              AND chapters.name = 'General'
            """
        )
    )

    op.alter_column(
        "expense_reports",
        "chapter_id",
        existing_type=sa.UUID(),
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "expense_reports",
        "chapter_id",
        existing_type=sa.UUID(),
        nullable=True,
    )
    op.drop_constraint(
        op.f("expense_reports_event_id_fkey"),
        "expense_reports",
        type_="foreignkey",
    )
    op.drop_constraint(
        op.f("expense_reports_chapter_id_fkey"),
        "expense_reports",
        type_="foreignkey",
    )
    op.drop_index(op.f("ix_expense_reports_event_id"), table_name="expense_reports")
    op.drop_index(op.f("ix_expense_reports_chapter_id"), table_name="expense_reports")
    op.drop_column("expense_reports", "event_id")
    op.drop_column("expense_reports", "chapter_id")
    op.drop_index(op.f("ix_events_chapter_id"), table_name="events")
    op.drop_table("events")
    op.drop_index(op.f("ix_chapters_organization_id"), table_name="chapters")
    op.drop_table("chapters")
