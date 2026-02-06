"""add extracted_metrics to monitoring uploads

Revision ID: 0c2d7fb6f05c
Revises: f41cc240cf22
Create Date: 2026-02-05 18:40:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0c2d7fb6f05c'
down_revision = 'f41cc240cf22'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('monitoring_uploads', sa.Column('extracted_metrics', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('monitoring_uploads', 'extracted_metrics')
