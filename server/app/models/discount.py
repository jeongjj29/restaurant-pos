from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from sqlalchemy_serializer import SerializerMixin

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