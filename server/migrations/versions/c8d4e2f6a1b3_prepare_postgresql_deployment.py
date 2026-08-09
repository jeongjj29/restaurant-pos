"""prepare PostgreSQL deployment

Revision ID: c8d4e2f6a1b3
Revises: b7f3f9a1c2d4
Create Date: 2026-08-09 00:00:01.000000

"""

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = "c8d4e2f6a1b3"
down_revision = "b7f3f9a1c2d4"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.alter_column(
            "phone_number",
            existing_type=sa.Integer(),
            type_=sa.String(length=20),
            existing_nullable=True,
            postgresql_using="phone_number::text",
        )

    with op.batch_alter_table("tables", schema=None) as batch_op:
        batch_op.create_unique_constraint("uq_tables_number", ["number"])
        batch_op.create_unique_constraint(
            "uq_tables_location_x_location_y", ["location_x", "location_y"]
        )

    token_indexes = {
        index["name"]
        for index in sa.inspect(op.get_bind()).get_indexes("token_blocklist")
    }
    if "ix_token_blocklist_jti" not in token_indexes:
        op.create_index(
            "ix_token_blocklist_jti", "token_blocklist", ["jti"], unique=True
        )
    op.create_index("ix_users_role_id", "users", ["role_id"], unique=False)
    op.create_index("ix_orders_user_id", "orders", ["user_id"], unique=False)
    op.create_index("ix_orders_table_id", "orders", ["table_id"], unique=False)
    op.create_index("ix_orders_status", "orders", ["status"], unique=False)
    op.create_index("ix_payments_order_id", "payments", ["order_id"], unique=False)
    op.create_index(
        "ix_order_items_order_id", "order_items", ["order_id"], unique=False
    )
    op.create_index(
        "ix_order_items_menu_item_id",
        "order_items",
        ["menu_item_id"],
        unique=False,
    )


def downgrade():
    op.drop_index("ix_order_items_menu_item_id", table_name="order_items")
    op.drop_index("ix_order_items_order_id", table_name="order_items")
    op.drop_index("ix_payments_order_id", table_name="payments")
    op.drop_index("ix_orders_status", table_name="orders")
    op.drop_index("ix_orders_table_id", table_name="orders")
    op.drop_index("ix_orders_user_id", table_name="orders")
    op.drop_index("ix_users_role_id", table_name="users")
    op.drop_index("ix_token_blocklist_jti", table_name="token_blocklist")

    with op.batch_alter_table("tables", schema=None) as batch_op:
        batch_op.drop_constraint("uq_tables_location_x_location_y", type_="unique")
        batch_op.drop_constraint("uq_tables_number", type_="unique")

    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.alter_column(
            "phone_number",
            existing_type=sa.String(length=20),
            type_=sa.Integer(),
            existing_nullable=True,
            postgresql_using="phone_number::integer",
        )
