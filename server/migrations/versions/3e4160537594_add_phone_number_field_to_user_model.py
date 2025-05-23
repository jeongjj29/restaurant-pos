"""add phone number field to user model

Revision ID: 3e4160537594
Revises: 80d9fd1dba9a
Create Date: 2025-04-05 03:05:51.131239

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3e4160537594'
down_revision = '80d9fd1dba9a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('phone_number', sa.Integer(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('phone_number')

    # ### end Alembic commands ###
