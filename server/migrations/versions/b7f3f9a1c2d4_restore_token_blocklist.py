"""restore token blocklist

Revision ID: b7f3f9a1c2d4
Revises: 3e4160537594
Create Date: 2026-08-09 00:00:00.000000

"""

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = "b7f3f9a1c2d4"
down_revision = "3e4160537594"
branch_labels = None
depends_on = None


def upgrade():
    if "token_blocklist" in sa.inspect(op.get_bind()).get_table_names():
        return

    op.create_table(
        "token_blocklist",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("jti", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    if "token_blocklist" in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table("token_blocklist")
