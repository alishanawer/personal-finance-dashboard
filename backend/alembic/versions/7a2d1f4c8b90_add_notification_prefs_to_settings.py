"""add notification prefs to settings

Revision ID: 7a2d1f4c8b90
Revises: 3b7f8c9a1d2e
Create Date: 2026-05-10 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "7a2d1f4c8b90"
down_revision = "3b7f8c9a1d2e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "settings",
        sa.Column("email_notifications", sa.Boolean(),
                  nullable=False, server_default=sa.true()),
    )
    op.add_column(
        "settings",
        sa.Column("budget_alerts", sa.Boolean(),
                  nullable=False, server_default=sa.true()),
    )
    op.add_column(
        "settings",
        sa.Column("weekly_summary", sa.Boolean(),
                  nullable=False, server_default=sa.false()),
    )
    op.alter_column("settings", "email_notifications", server_default=None)
    op.alter_column("settings", "budget_alerts", server_default=None)
    op.alter_column("settings", "weekly_summary", server_default=None)


def downgrade() -> None:
    op.drop_column("settings", "weekly_summary")
    op.drop_column("settings", "budget_alerts")
    op.drop_column("settings", "email_notifications")
