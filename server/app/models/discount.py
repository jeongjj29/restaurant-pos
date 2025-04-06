from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import DECIMAL

class Discount(db.Model, SerializerMixin):
    __tablename__ = "discounts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    amount = db.Column(db.DECIMAL(precision=10, scale=2), nullable=False)

    @validates("name")
    def validate_name(self, key, name):
        if len(name) < 3:
            raise ValueError("Name must be at least 3 characters long")
        return name

    @validates("amount")
    def validate_amount(self, key, amount):
        if amount <= 0:
            raise ValueError("Invalid discount amount")
        return amount

    def __repr__(self):
        return f"<Discount {self.id} | {self.name}: ${self.amount}>"