"""add display currency to settings

Revision ID: 1d4c9f7a2e11
Revises: 7a2d1f4c8b90
Create Date: 2026-05-10 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "1d4c9f7a2e11"
down_revision = "7a2d1f4c8b90"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "settings",
        sa.Column("display_currency", sa.String(),
                  nullable=False, server_default="USD"),
    )
    op.execute(
        "UPDATE settings SET display_currency = currency WHERE display_currency IS NULL")
    op.alter_column("settings", "display_currency", server_default=None)


def downgrade() -> None:
    op.drop_column("settings", "display_currency")
