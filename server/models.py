from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy

from config import db


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

    def __repr__(self):
        return f"<User {self.id}: {self.username} | Name: {self.first_name} {self.last_name} | Role: {self.role}>"


class Role(db.Model, SerializerMixin):
    __tablename__ = "roles"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    access_level = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<Role {self.id}: {self.name} | Access Level: {self.access_level}>"


class Order(db.Model, SerializerMixin):
    __tablename__ = "orders"
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String, nullable=False)
    guests = db.Column(db.Integer, nullable=True)
    total_price = db.Column(db.Float, default=0.0)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    table_id = db.Column(db.Integer, db.ForeignKey("tables.id"))
    created_at = db.Column(db.DateTime, default=db.func.now())
    closed_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"<Order {self.id}: {self.type}>"


class Table(db.Model, SerializerMixin):
    __tablename__ = "tables"
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<Table {self.id}: {self.name} | Capacity: {self.capacity}>"
