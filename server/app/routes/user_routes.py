from flask import Blueprint, request, make_response
from app.models import User
from app.extensions import db
from .utils import get_or_404

user_bp = Blueprint("user_bp", __name__, url_prefix="/api/users")


@user_bp.route("/", methods=["GET"])
def get_users():
    users = [u.to_dict() for u in User.query.all()]
    return make_response(users, 200)


@user_bp.route("/", methods=["POST"])
def create_user():
    data = dict(request.get_json(silent=True) or {})
    password = data.pop("password")
    if not isinstance(password, str) or not password:
        raise ValueError("Password is required")

    data.pop("_password_hash", None)
    data["password_hash"] = password
    user = User(**data)
    db.session.add(user)
    db.session.commit()
    return make_response(user.to_dict()), 201


@user_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
def handle_user(id):
    user = get_or_404(User, id)

    if request.method == "GET":
        return make_response(user.to_dict(), 200)

    if request.method == "PATCH":
        data = dict(request.get_json(silent=True) or {})
        data.pop("id", None)
        data.pop("_password_hash", None)
        data.pop("password_hash", None)
        password = data.pop("password", None)

        for key, value in data.items():
            setattr(user, key, value)

        if password not in (None, ""):
            if not isinstance(password, str):
                raise ValueError("Password must be a string")
            user.password_hash = password

        db.session.commit()
        return make_response(user.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(user)
        db.session.commit()
        return make_response({}, 204)


@user_bp.route("/<int:id>/orders", methods=["GET"])
def get_user_orders(id):
    user = get_or_404(User, id)
    orders = [o.to_dict() for o in user.orders]
    return make_response(orders, 200)
