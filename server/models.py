from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime
import re

from config import db, bcrypt


ORDER_STATUS = ["open", "closed"]
ORDER_TYPE = ["dine_in", "take_out"]
PAYMENT_TYPE = ["cash", "card"]
ACCESS_LEVEL = [1, 2, 3, 4]


class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)
    _password_hash = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(
        db.DateTime, default=db.func.now(), onupdate=db.func.now(), nullable=True
    )

    role = db.relationship("Role", back_populates="users")
    orders = db.relationship("Order", back_populates="user")

    serialize_rules = ("-orders.table", "-orders.user", "-role.users", "-tables.user")

    @validates("username")
    def validate_username(self, key, username):
        if len(username) < 3:
            raise ValueError("Username must be at least 3 characters long")
        return username

    @validates("first_name", "last_name")
    def validate_name(self, key, name):
        if len(name) < 3:
            raise ValueError("Name must be at least 3 characters long")
        return name

    @validates("email")
    def validate_email(self, key, email):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            raise ValueError("Invalid email address")
        return email

    @hybrid_property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode("utf-8"))
        self._password_hash = password_hash.decode("utf-8")

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode("utf-8"))

    def __repr__(self):
        return f"<User {self.id}: {self.username} | Name: {self.first_name} {self.last_name} | Role: {self.role}>"


class Role(db.Model, SerializerMixin):
    __tablename__ = "roles"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    access_level = db.Column(db.Integer, nullable=False)

    users = db.relationship("User", back_populates="role")

    serialize_rules = ("-users.role",)

    @validates("name")
    def validate_name(self, key, name):
        if len(name) < 3:
            raise ValueError("Name must be at least 3 characters long")
        return name

    @validates("access_level")
    def validate_access_level(self, key, access_level):
        if access_level not in ACCESS_LEVEL:
            raise ValueError("Invalid access level")
        return access_level

    def __repr__(self):
        return f"<Role {self.id}: {self.name} | Access Level: {self.access_level}>"


class Order(db.Model, SerializerMixin):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String, nullable=False)
    guests = db.Column(db.Integer, default=0)
    total_price = db.Column(db.Float, default=0.0)
    status = db.Column(db.String, nullable=False)
    sales_tax = db.Column(db.Float, default=0.08875)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    table_id = db.Column(db.Integer, db.ForeignKey("tables.id"))
    created_at = db.Column(db.DateTime, default=db.func.now())
    closed_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User", back_populates="orders")
    table = db.relationship("Table", back_populates="orders")
    order_items = db.relationship("OrderItem", back_populates="order")
    payments = db.relationship("Payment", back_populates="order")

    serialize_rules = (
        "-user.orders",
        "-table.orders",
        "-order_items.order",
        "-payments.order",
        "-menu_items.order",
    )

    @validates("type")
    def validate_type(self, key, type):
        if type not in ORDER_TYPE:
            raise ValueError("Invalid order type")
        return type

    @validates("guests", "total_price")
    def validate_guests(self, key, guests):
        if guests < 0:
            raise ValueError("Invalid number of guests")
        return guests

    @validates("status")
    def validate_status(self, key, status):
        if status not in ORDER_STATUS:
            raise ValueError("Invalid order status")
        return status

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

    @validates("number", "capacity")
    def validate_values(self, key, value):
        if value < 1:
            raise ValueError("Invalid table {key}")
        return value

    def __repr__(self):
        return f"<Table {self.id}: {self.number} | Capacity: {self.capacity}>"


class Payment(db.Model, SerializerMixin):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    type = db.Column(db.String, nullable=False)

    order = db.relationship("Order", back_populates="payments")

    serialize_rules = ("-order.payments", "-order.user", "-role.users", "-tables.user")

    @validates("amount")
    def validate_amount(self, key, amount):
        if amount < 0:
            raise ValueError("Invalid payment amount")
        return amount

    @validates("type")
    def validate_type(self, key, type):
        if type not in PAYMENT_TYPE:
            raise ValueError("Invalid payment type")
        return type

    def __repr__(self):
        return f"<Payment {self.id} | {self.type}: ${self.amount}>"


class OrderItem(db.Model, SerializerMixin):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    discount_id = db.Column(db.Integer, db.ForeignKey("discounts.id"), nullable=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey("menu_items.id"), nullable=False)

    order = db.relationship("Order", back_populates="order_items")
    menu_item = db.relationship("MenuItem", back_populates="order_items")

    serialize_rules = (
        "-order.order_items",
        "-order.user",
        "-role.users",
        "-tables.user",
    )

    @validates("quantity")
    def validate_quantity(self, key, quantity):
        if quantity < 1:
            raise ValueError("Invalid quantity")
        return quantity

    @validates("price")
    def validate_price(self, key, price):
        if price < 0:
            raise ValueError("Invalid price")
        return price

    def __repr__(self):
        return f"<OrderItem {self.id} | {self.order} | {self.menu_item}>"


class Discount(db.Model, SerializerMixin):
    __tablename__ = "discounts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    amount = db.Column(db.Float, nullable=False)

    @validates("name")
    def validate_name(self, key, name):
        if len(name) < 3:
            raise ValueError("Name must be at least 3 characters long")
        return name

    @validates("amount")
    def validate_amount(self, key, amount):
        if not (0 < amount <= 1):
            raise ValueError("Invalid discount amount")
        return amount

    def __repr__(self):
        return f"<Discount {self.id} | {self.name}: ${self.amount}>"


class MenuItem(db.Model, SerializerMixin):
    __tablename__ = "menu_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    secondary_name = db.Column(db.String, nullable=True)
    description = db.Column(db.String, nullable=True)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String, nullable=True)
    category_id = db.Column(
        db.Integer, db.ForeignKey("menu_categories.id"), nullable=False
    )

    order_items = db.relationship("OrderItem", back_populates="menu_item")
    menu_category = db.relationship("MenuCategory", back_populates="menu_items")

    serialize_rules = (
        "-order_items.menu_item",
        "-order_items.order",
        "-order.user",
        "-role.users",
        "-tables.user",
        "-menu_category.menu_items",
    )

    @validates("name")
    def validate_name(self, key, name):
        if len(name) < 3:
            raise ValueError("Name must be at least 3 characters long")
        return name

    @validates("price")
    def validate_price(self, key, price):
        if price < 0:
            raise ValueError("Invalid price")
        return price

    def __repr__(self):
        return f"<MenuItem {self.id} | {self.name}: ${self.price}>"


class MenuCategory(db.Model, SerializerMixin):
    __tablename__ = "menu_categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    secondary_name = db.Column(db.String, nullable=True)

    # Relationships
    menu_items = db.relationship("MenuItem", back_populates="menu_category")

    # Serialization rules to prevent recursion
    serialize_rules = (
        "-menu_items.menu_category",
        "-menu_items.order_items",
        "-menu_items.order",
    )

    # Validation
    @validates("name")
    def validate_name(self, key, name):
        if len(name) < 3:
            raise ValueError("Category name must be at least 3 characters long")
        return name

    def __repr__(self):
        return f"<MenuCategory {self.id} | {self.name}>"


class TokenBlockList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
