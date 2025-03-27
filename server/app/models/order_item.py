from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from sqlalchemy_serializer import SerializerMixin

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