from flask import Blueprint, make_response
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    jwt_required,
    set_access_cookies,
    unset_jwt_cookies,
)
from sqlalchemy.exc import SQLAlchemyError
from app.authorization import access_level_required, current_user
from app.models import User, TokenBlockList
from app.extensions import db, jwt
from .utils import get_json_object

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")


@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return TokenBlockList.query.filter_by(jti=jti).first() is not None


@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return make_response({"description": "The token has been revoked"}, 401)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = get_json_object({"username", "password"})

    username_value = data.get("username")
    password = data.get("password")

    if username_value is None or password is None:
        return make_response({"message": "Username and password are required"}, 400)

    if not isinstance(username_value, str) or not isinstance(password, str):
        return make_response({"message": "Username and password must be strings"}, 400)

    username = username_value.strip()

    if not username or not password:
        return make_response({"message": "Username and password are required"}, 400)

    user = User.query.filter_by(username=username).first()

    if user and user.authenticate(password):
        access_token = create_access_token(identity=str(user.id))
        response = make_response({"user": user.to_dict()}, 200)
        set_access_cookies(response, access_token)
        return response
    return make_response({"message": "Invalid credentials"}, 401)


@auth_bp.route("/me", methods=["GET"])
@access_level_required()
def me():
    return make_response({"user": current_user().to_dict()}, 200)


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    token = TokenBlockList(jti=jti)
    response = make_response(
        {"message": "Signed out locally, but session revocation could not be recorded"},
        503,
    )
    try:
        db.session.add(token)
        db.session.commit()
        response = make_response({"message": "Successfully logged out"}, 200)
    except SQLAlchemyError:
        db.session.rollback()
    finally:
        unset_jwt_cookies(response)
    return response


@auth_bp.route("/protected", methods=["GET"])
@access_level_required()
def protected():
    user = current_user()
    return make_response({"message": f"Hello, {user.username}"}, 200)
