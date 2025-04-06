from flask import Blueprint, request, make_response
from app.models import Role
from app.extensions import db

role_bp = Blueprint("roles", __name__, url_prefix="/api/roles")

@role_bp.route("/", methods=["GET"])
def get_roles():
    roles = [role.to_dict() for role in Role.query.all()]
    return make_response(roles, 200)

@role_bp.route("/", methods=["POST"])
def create_role():
    data = request.get_json()
    role = Role(**data)
    db.session.add(role)
    db.session.commit()
    return make_response(role.to_dict(), 201)

@role_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
def handle_role(id):
    role = Role.query.get_or_404(id)

    if request.method == "GET":
        return make_response(role.to_dict(), 200)

    if request.method == "PATCH":
        for key, value in request.get_json().items():
            setattr(role, key, value)
        db.session.commit()
        return make_response(role.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(role)
        db.session.commit()
        return make_response({}, 204)
    
@role_bp.route("/<int:id>/users", methods=["GET"])
def get_role_users(id):
    role = Role.query.get_or_404(id)
    users = [user.to_dict() for user in role.users]
    return make_response(users, 200)