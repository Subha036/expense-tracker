"""update user defaults

Revision ID: 999999999999
Revises: 963799b50059
Create Date: 2025-12-31 07:18:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '999999999999'
down_revision: Union[str, None] = '963799b50059'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Update monthly_budget to 5000 for users with 0 or null
    op.execute("UPDATE users SET monthly_budget = 5000.0 WHERE monthly_budget = 0.0 OR monthly_budget IS NULL")
    # Update email_notifications_enabled to True
    op.execute("UPDATE users SET email_notifications_enabled = true")


def downgrade() -> None:
    # Revert to 0.0
    op.execute("UPDATE users SET monthly_budget = 0.0 WHERE monthly_budget = 5000.0")
    # Revert to False
    op.execute("UPDATE users SET email_notifications_enabled = false")