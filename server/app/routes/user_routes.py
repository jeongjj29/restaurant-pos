import bcrypt
from flask import Blueprint, request, make_response
from app.models import User
from app.extensions import db

user_bp = Blueprint("user_bp", __name__, url_prefix="/api/users")

@user_bp.route("/", methods=["GET"])
def get_users():
    users = [u.to_dict() for u in User.query.all()]
    return make_response(users, 200)

@user_bp.route("/", methods=["POST"])
def create_user():
    data = request.get_json()
    password = data.pop("password")
    if password:
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        data["password_hash"] = password_hash.decode("utf-8")
    user = User(**data)
    db.session.add(user)
    db.session.commit()
    return make_response(user.to_dict()), 201

@user_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
def handle_user(id):
    user = User.query.get_or_404(id)

    if request.method == "GET":
        return make_response(user.to_dict(), 200)

    if request.method == "PATCH":
        for key, value in request.get_json().items():
            setattr(user, key, value)
        db.session.commit()
        return make_response(user.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(user)
        db.session.commit()
        return make_response({}, 204)

@user_bp.route("/<int:id>/orders", methods=["GET"])
def get_user_orders(id):
    user = User.query.get_or_404(id)
    orders = [o.to_dict() for o in user.orders]
    return make_response(orders, 200)