"""add_email_notifications_enabled

Revision ID: 963799b50059
Revises: 002
Create Date: 2025-12-31 05:31:54.249471+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '963799b50059'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add email_notifications_enabled column to users table (nullable first)
    op.add_column('users', sa.Column('email_notifications_enabled', sa.Boolean(), nullable=True))
    # Update existing rows to default value
    op.execute("UPDATE users SET email_notifications_enabled = false WHERE email_notifications_enabled IS NULL")
    # Alter column to not nullable
    op.alter_column('users', 'email_notifications_enabled', nullable=False)


def downgrade() -> None:
    # Remove email_notifications_enabled column
    op.drop_column('users', 'email_notifications_enabled')