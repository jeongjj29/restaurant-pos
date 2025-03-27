from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from sqlalchemy_serializer import SerializerMixin

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