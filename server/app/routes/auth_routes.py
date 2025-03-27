from flask import Blueprint,request, make_response
from flask_jwt_extended import (JWTManager, create_access_token, jwt_required, get_jwt_identity)
from app.models import User, TokenBlockList
from app.extensions import db, jwt

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
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user and user.authenticate(password):
        access_token = create_access_token(identity=user.id)
        return make_response(
            {"access_token": access_token, "user": user.to_dict()}, 200
        )
    return make_response({"message": "Invalid credentials"}, 401)

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt_identity()
    token = TokenBlockList(jti=jti)
    db.session.add(token)
    db.session.commit()
    return make_response({"message": "Successfully logged out"}, 200)

@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return make_response({"message": f"Hello, {user['username']}"}), 200