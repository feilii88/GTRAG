"""Initial migration

Revision ID: d93d9e22cc26
Revises: 8a4002ad1ce0
Create Date: 2024-09-12 07:55:08.419271

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'd93d9e22cc26'
down_revision: Union[str, None] = '8a4002ad1ce0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('status', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.drop_column('users', 'role')
    op.drop_column('users', 'name')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('users', sa.Column('role', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.drop_column('users', 'status')
    # ### end Alembic commands ###
