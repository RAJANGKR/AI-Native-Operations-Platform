"""make members organization_id nullable for superadmin accounts

Revision ID: f6e633d7d470
Revises: 5c33fce11b21
Create Date: 2026-08-19 16:36:11.711562

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f6e633d7d470'
down_revision: Union[str, Sequence[str], None] = '5c33fce11b21'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column("members", "organization_id", existing_type=sa.UUID(), nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column("members", "organization_id", existing_type=sa.UUID(), nullable=False)
