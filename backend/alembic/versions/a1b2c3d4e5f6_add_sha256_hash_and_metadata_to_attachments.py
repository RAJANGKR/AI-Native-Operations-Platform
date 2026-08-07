"""add sha256_hash and metadata to attachments

Revision ID: a1b2c3d4e5f6
Revises: 908915327f5b
Create Date: 2026-08-07 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '908915327f5b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('attachments', sa.Column('original_filename', sa.String(length=255), nullable=True))
    op.add_column('attachments', sa.Column('size_bytes', sa.Integer(), server_default='0', nullable=False))
    op.add_column('attachments', sa.Column('sha256_hash', sa.String(length=64), nullable=True))
    op.add_column('attachments', sa.Column('uploaded_by', sa.UUID(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('attachments', 'uploaded_by')
    op.drop_column('attachments', 'sha256_hash')
    op.drop_column('attachments', 'size_bytes')
    op.drop_column('attachments', 'original_filename')
