from flask import Blueprint, request, make_response
from app.authorization import (
    ADMIN_ACCESS_LEVEL,
    MANAGER_ACCESS_LEVEL,
    access_level_required,
)
from app.models import Role
from app.extensions import db
from .utils import get_json_object, get_or_404

role_bp = Blueprint("roles", __name__, url_prefix="/api/roles")
ROLE_FIELDS = {"name", "access_level"}


@role_bp.route("/", methods=["GET"])
@access_level_required(MANAGER_ACCESS_LEVEL)
def get_roles():
    roles = [role.to_dict() for role in Role.query.all()]
    return make_response(roles, 200)


@role_bp.route("/", methods=["POST"])
@access_level_required(ADMIN_ACCESS_LEVEL)
def create_role():
    data = get_json_object(ROLE_FIELDS)
    role = Role(name=data["name"], access_level=data["access_level"])
    db.session.add(role)
    db.session.commit()
    return make_response(role.to_dict(), 201)


@role_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
@access_level_required(
    MANAGER_ACCESS_LEVEL,
    method_levels={"PATCH": ADMIN_ACCESS_LEVEL, "DELETE": ADMIN_ACCESS_LEVEL},
)
def handle_role(id):
    role = get_or_404(Role, id)

    if request.method == "GET":
        return make_response(role.to_dict(), 200)

    if request.method == "PATCH":
        data = get_json_object(ROLE_FIELDS)
        for key, value in data.items():
            setattr(role, key, value)
        db.session.commit()
        return make_response(role.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(role)
        db.session.commit()
        return make_response({}, 204)


@role_bp.route("/<int:id>/users", methods=["GET"])
@access_level_required(MANAGER_ACCESS_LEVEL)
def get_role_users(id):
    role = get_or_404(Role, id)
    users = [user.to_dict() for user in role.users]
    return make_response(users, 200)
