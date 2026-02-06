"""add parse_error to monitoring uploads

Revision ID: 1c4f7a6c8c2e
Revises: 0c2d7fb6f05c
Create Date: 2026-02-05 19:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1c4f7a6c8c2e'
down_revision = '0c2d7fb6f05c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('monitoring_uploads', sa.Column('parse_error', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('monitoring_uploads', 'parse_error')
