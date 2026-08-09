from flask import Blueprint, current_app, request, make_response
from app.authorization import (
    ADMIN_ACCESS_LEVEL,
    MANAGER_ACCESS_LEVEL,
    access_level_required,
)
from app.models import User
from app.extensions import db
from .utils import get_json_object, get_or_404

user_bp = Blueprint("user_bp", __name__, url_prefix="/api/users")
USER_FIELDS = {
    "username",
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "role_id",
    "password",
}


def _validate_password(password):
    minimum_length = int(current_app.config.get("MIN_PASSWORD_LENGTH", 8))
    if not isinstance(password, str) or not password:
        raise ValueError("Password is required")
    if len(password) < minimum_length:
        raise ValueError(f"Password must be at least {minimum_length} characters long")
    return password


@user_bp.route("/", methods=["GET"])
@access_level_required(MANAGER_ACCESS_LEVEL)
def get_users():
    users = [u.to_dict() for u in User.query.all()]
    return make_response(users, 200)


@user_bp.route("/", methods=["POST"])
@access_level_required(ADMIN_ACCESS_LEVEL)
def create_user():
    data = get_json_object(USER_FIELDS)
    password = _validate_password(data.pop("password"))

    user = User(
        username=data["username"],
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        phone_number=data.get("phone_number"),
        role_id=data["role_id"],
        password_hash=password,
    )
    db.session.add(user)
    db.session.commit()
    return make_response(user.to_dict()), 201


@user_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
@access_level_required(
    MANAGER_ACCESS_LEVEL,
    method_levels={"PATCH": ADMIN_ACCESS_LEVEL, "DELETE": ADMIN_ACCESS_LEVEL},
)
def handle_user(id):
    user = get_or_404(User, id)

    if request.method == "GET":
        return make_response(user.to_dict(), 200)

    if request.method == "PATCH":
        data = get_json_object(USER_FIELDS)
        password = data.pop("password", None)

        for key, value in data.items():
            setattr(user, key, value)

        if password is not None:
            user.password_hash = _validate_password(password)

        db.session.commit()
        return make_response(user.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(user)
        db.session.commit()
        return make_response({}, 204)


@user_bp.route("/<int:id>/orders", methods=["GET"])
@access_level_required(MANAGER_ACCESS_LEVEL)
def get_user_orders(id):
    user = get_or_404(User, id)
    orders = [o.to_dict() for o in user.orders]
    return make_response(orders, 200)
