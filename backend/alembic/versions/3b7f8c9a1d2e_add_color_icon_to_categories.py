"""add color and icon to categories

Revision ID: 3b7f8c9a1d2e
Revises: ff9ee8cc45e7
Create Date: 2026-05-10 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "3b7f8c9a1d2e"
down_revision = "ff9ee8cc45e7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("categories", sa.Column("color", sa.String(), nullable=True))
    op.add_column("categories", sa.Column("icon", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("categories", "icon")
    op.drop_column("categories", "color")
