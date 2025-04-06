from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from sqlalchemy_serializer import SerializerMixin
from app.constants import ACCESS_LEVEL

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