"""initial migration

Revision ID: add4bab829ea
Revises: 
Create Date: 2024-10-08 13:02:24.629734

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add4bab829ea'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('categories',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('secondary_name', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('discounts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('amount', sa.Float(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('roles',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('access_level', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('tables',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('number', sa.Integer(), nullable=False),
    sa.Column('capacity', sa.Integer(), nullable=False),
    sa.Column('location_x', sa.Integer(), nullable=True),
    sa.Column('location_y', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('menu_items',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('secondary_name', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=False),
    sa.Column('price', sa.Float(), nullable=False),
    sa.Column('image', sa.String(), nullable=True),
    sa.Column('category_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['category_id'], ['categories.id'], name=op.f('fk_menu_items_category_id_categories')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('first_name', sa.String(), nullable=False),
    sa.Column('last_name', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('role_id', sa.Integer(), nullable=False),
    sa.Column('_password_hash', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['role_id'], ['roles.id'], name=op.f('fk_users_role_id_roles')),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('orders',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('type', sa.String(), nullable=False),
    sa.Column('guests', sa.Integer(), nullable=True),
    sa.Column('total_price', sa.Float(), nullable=True),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('table_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('closed_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['table_id'], ['tables.id'], name=op.f('fk_orders_table_id_tables')),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_orders_user_id_users')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('order_items',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('order_id', sa.Integer(), nullable=False),
    sa.Column('menu_item_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['menu_item_id'], ['menu_items.id'], name=op.f('fk_order_items_menu_item_id_menu_items')),
    sa.ForeignKeyConstraint(['order_id'], ['orders.id'], name=op.f('fk_order_items_order_id_orders')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('payments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('amount', sa.Float(), nullable=False),
    sa.Column('order_id', sa.Integer(), nullable=False),
    sa.Column('payment_type', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['order_id'], ['orders.id'], name=op.f('fk_payments_order_id_orders')),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('payments')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('users')
    op.drop_table('menu_items')
    op.drop_table('tables')
    op.drop_table('roles')
    op.drop_table('discounts')
    op.drop_table('categories')
    # ### end Alembic commands ###
