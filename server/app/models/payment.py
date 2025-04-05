from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from sqlalchemy_serializer import SerializerMixin
from app.constants import PAYMENT_TYPE
from sqlalchemy import DECIMAL

class Payment(db.Model, SerializerMixin):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.DECIMAL(precision=10, scale=2), nullable=False)
    type = db.Column(db.String, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)

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