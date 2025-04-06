from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from sqlalchemy_serializer import SerializerMixin


class MenuCategory(db.Model, SerializerMixin):
    __tablename__ = "menu_categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    secondary_name = db.Column(db.String, nullable=True)

    menu_items = db.relationship("MenuItem", back_populates="menu_category")

    serialize_rules = (
        "-menu_items.menu_category",
        "-menu_items.order_items",
        "-menu_items.order",
    )

    @validates("name")
    def validate_name(self, key, name):
        if len(name) < 3:
            raise ValueError("Category name must be at least 3 characters long")
        return name

    def __repr__(self):
        return f"<MenuCategory {self.id} | {self.name}>"
