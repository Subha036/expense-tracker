"""Add OAuth fields to users

Revision ID: 002
Revises: 001
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add OAuth fields to users table
    op.add_column('users', sa.Column('provider', sa.String(50), default='local'))
    op.add_column('users', sa.Column('provider_id', sa.String(255), nullable=True))
    # Make hashed_password nullable for OAuth users
    op.alter_column('users', 'hashed_password', nullable=True)


def downgrade() -> None:
    # Remove OAuth fields
    op.drop_column('users', 'provider_id')
    op.drop_column('users', 'provider')
    # Make hashed_password not nullable again
    op.alter_column('users', 'hashed_password', nullable=False)