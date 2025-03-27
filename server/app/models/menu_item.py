from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from sqlalchemy_serializer import SerializerMixin

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
        "-order_items",
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