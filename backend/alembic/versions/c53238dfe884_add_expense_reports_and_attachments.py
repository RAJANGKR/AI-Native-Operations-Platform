"""add expense reports and attachments

Revision ID: c53238dfe884
Revises: 705a6af82482
Create Date: 2026-08-05 15:30:33.046241

"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c53238dfe884'
down_revision: Union[str, Sequence[str], None] = '705a6af82482'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('expense_reports',
    sa.Column('organization_id', sa.UUID(), nullable=False),
    sa.Column('member_id', sa.UUID(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('status', sa.Enum('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID', name='expensereportstatus'), nullable=False),
    sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['member_id'], ['members.id'], ),
    sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('attachments',
    sa.Column('expense_id', sa.UUID(), nullable=False),
    sa.Column('type', sa.Enum('RECEIPT', 'INVOICE', 'BOARDING_PASS', 'OTHER', name='attachmenttype'), nullable=False),
    sa.Column('storage_path', sa.String(length=512), nullable=False),
    sa.Column('mime_type', sa.String(length=255), nullable=False),
    sa.Column('ocr_status', sa.Enum('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', name='ocrstatus'), nullable=False),
    sa.Column('ocr_text', sa.Text(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['expense_id'], ['expenses.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.add_column('expenses', sa.Column('report_id', sa.UUID(), nullable=True))
    op.add_column('expenses', sa.Column('merchant', sa.String(length=255), nullable=True))
    op.add_column('expenses', sa.Column('notes', sa.Text(), nullable=True))
    op.alter_column('expenses', 'budget_id',
               existing_type=sa.UUID(),
               nullable=True)

    bind = op.get_bind()
    expenses_rows = bind.execute(
        sa.text(
            """
            SELECT id, organization_id, member_id, created_at, updated_at
            FROM expenses
            """
        )
    ).mappings()

    for row in expenses_rows:
        report_id = uuid.uuid4()
        bind.execute(
            sa.text(
                """
                INSERT INTO expense_reports (
                    id,
                    organization_id,
                    member_id,
                    title,
                    description,
                    status,
                    submitted_at,
                    approved_at,
                    created_at,
                    updated_at
                ) VALUES (
                    :id,
                    :organization_id,
                    :member_id,
                    :title,
                    :description,
                    :status,
                    :submitted_at,
                    :approved_at,
                    :created_at,
                    :updated_at
                )
                """
            ),
            {
                "id": report_id,
                "organization_id": row["organization_id"],
                "member_id": row["member_id"],
                "title": "Migrated expense report",
                "description": "Auto-generated during expense report migration",
                "status": "DRAFT",
                "submitted_at": None,
                "approved_at": None,
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
            },
        )
        bind.execute(
            sa.text(
                """
                UPDATE expenses
                SET report_id = :report_id
                WHERE id = :expense_id
                """
            ),
            {
                "report_id": report_id,
                "expense_id": row["id"],
            },
        )

    op.alter_column('expenses', 'report_id',
               existing_type=sa.UUID(),
               nullable=False)
    op.drop_constraint(op.f('expenses_member_id_fkey'), 'expenses', type_='foreignkey')
    op.drop_constraint(op.f('expenses_organization_id_fkey'), 'expenses', type_='foreignkey')
    op.create_foreign_key(op.f('expenses_report_id_fkey'), 'expenses', 'expense_reports', ['report_id'], ['id'])
    op.drop_column('expenses', 'organization_id')
    op.drop_column('expenses', 'description')
    op.drop_column('expenses', 'member_id')


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('expenses', sa.Column('member_id', sa.UUID(), autoincrement=False, nullable=True))
    op.add_column('expenses', sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True))
    op.add_column('expenses', sa.Column('organization_id', sa.UUID(), autoincrement=False, nullable=True))

    bind = op.get_bind()
    bind.execute(
        sa.text(
            """
            UPDATE expenses
            SET
                organization_id = expense_reports.organization_id,
                member_id = expense_reports.member_id,
                description = expenses.notes
            FROM expense_reports
            WHERE expenses.report_id = expense_reports.id
            """
        )
    )

    op.alter_column('expenses', 'organization_id',
               existing_type=sa.UUID(),
               nullable=False)
    op.alter_column('expenses', 'member_id',
               existing_type=sa.UUID(),
               nullable=False)
    op.drop_constraint(op.f('expenses_report_id_fkey'), 'expenses', type_='foreignkey')
    op.create_foreign_key(op.f('expenses_organization_id_fkey'), 'expenses', 'organizations', ['organization_id'], ['id'])
    op.create_foreign_key(op.f('expenses_member_id_fkey'), 'expenses', 'members', ['member_id'], ['id'])
    op.alter_column('expenses', 'budget_id',
               existing_type=sa.UUID(),
               nullable=False)
    op.drop_column('expenses', 'notes')
    op.drop_column('expenses', 'merchant')
    op.drop_column('expenses', 'report_id')
    op.drop_table('attachments')
    op.drop_table('expense_reports')
