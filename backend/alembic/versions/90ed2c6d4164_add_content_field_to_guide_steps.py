"""Add content field to guide steps

Revision ID: 90ed2c6d4164
Revises: 2210204ea04e
Create Date: 2025-02-09 00:53:29.804239

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '90ed2c6d4164'
down_revision: Union[str, None] = '2210204ea04e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('guide_steps', sa.Column('content', sa.Text(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('guide_steps', 'content')
    # ### end Alembic commands ###
