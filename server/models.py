from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy

from config import db

ORDER_STATUS = ["open", "closed"]
ORDER_TYPE = ["dine_in", "take_out"]


class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)
    _password_hash = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(
        db.DateTime, default=db.func.now(), onupdate=db.func.now(), nullable=True
    )

    role = db.relationship("Role", back_populates="users")
    orders = db.relationship("Order", back_populates="user")
    tables = association_proxy("orders", "table")

    serialize_rules = ("-orders.table", "-orders.user", "-role.users", "-tables.user")



    def __repr__(self):
        return f"<User {self.id}: {self.username} | Name: {self.first_name} {self.last_name} | Role: {self.role}>"


class Role(db.Model, SerializerMixin):
    __tablename__ = "roles"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    access_level = db.Column(db.Integer, nullable=False)

    users = db.relationship("User", back_populates="role")

    serialize_rules = ("-users.role",)

    def __repr__(self):
        return f"<Role {self.id}: {self.name} | Access Level: {self.access_level}>"


class Order(db.Model, SerializerMixin):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String, nullable=False)
    guests = db.Column(db.Integer, nullable=True)
    total_price = db.Column(db.Float, default=0.0)
    status = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    table_id = db.Column(db.Integer, db.ForeignKey("tables.id"))
    created_at = db.Column(db.DateTime, default=db.func.now())
    closed_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User", back_populates="orders")
    table = db.relationship("Table", back_populates="orders")
    order_items = db.relationship("OrderItem", back_populates="order")
    payments = db.relationship("Payment", back_populates="order")
    menu_items = association_proxy("order_items", "menu_item")

    def __repr__(self):
        return f"<Order {self.id}: {self.type}>"


class Table(db.Model, SerializerMixin):
    __tablename__ = "tables"

    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    location_x = db.Column(db.Integer, nullable=True)
    location_y = db.Column(db.Integer, nullable=True)

    orders = db.relationship("Order", back_populates="table")

    serialize_rules = ("-orders.table", "-orders.user", "-role.users", "-tables.user")

    def __repr__(self):
        return f"<Table {self.id}: {self.name} | Capacity: {self.capacity}>"


class Payment(db.Model, SerializerMixin):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    payment_type = db.Column(db.String, nullable=False)

    order = db.relationship("Order", back_populates="payments")

    serialize_rules = ("-order.payments", "-order.user", "-role.users", "-tables.user")

    def __repr__(self):
        return f"<Payment {self.id} | {self.payment_type}: ${self.amount}>"


class OrderItem(db.Model, SerializerMixin):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey("menu_items.id"), nullable=False)

    order = db.relationship("Order", back_populates="order_items")
    menu_item = db.relationship("MenuItem", back_populates="order_items")

    serialize_rules = ("-order.order_items", "-order.user", "-role.users", "-tables.user")

    def __repr__(self):
        return f"<OrderItem {self.id} | {self.order} | {self.item}>"


class Discounts(db.Model, SerializerMixin):
    __tablename__ = "discounts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    amount = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f"<Discount {self.id} | {self.name}: ${self.amount}>"


class MenuItem(db.Model, SerializerMixin):
    __tablename__ = "menu_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    secondary_name = db.Column(db.String, nullable=True)
    description = db.Column(db.String, nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String, nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)

    order_items = db.relationship("OrderItem", back_populates="menu_item")
    category = db.relationship("MenuCategory", back_populates="menu_items")+

    serialize_rules = ("-order_items.menu_item", "-order_items.order", "-order.user", "-role.users", "-tables.user")

    def __repr__(self):
        return f"<MenuItem {self.id} | {self.name}: ${self.price}>"


class MenuCategory(db.Model, SerializerMixin):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    secondary_name = db.Column(db.String, nullable=True)

    menu_items = db.relationship("MenuItem", back_populates="category")
    
    serialize_rules = ("-menu_items.category", "-menu_items.order", "-order.user", "-role.users", "-tables.user")

    def __repr__(self):
        return f"<MenuCategory {self.id} | {self.name}>"
