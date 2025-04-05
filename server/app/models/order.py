from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from sqlalchemy_serializer import SerializerMixin
from app.constants import ORDER_STATUS, ORDER_TYPE

class Order(db.Model, SerializerMixin):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String, nullable=False)
    type = db.Column(db.String, nullable=False)
    guests = db.Column(db.Integer, default=0)
    total_price = db.Column(db.Decimal(precision=10, scale=2), default=0.0)
    sales_tax = db.Column(db.Decimal(precision=10, scale=5), default=0.08875)
    created_at = db.Column(db.DateTime, default=db.func.now())
    closed_at = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    table_id = db.Column(db.Integer, db.ForeignKey("tables.id"))

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