from functools import wraps

from flask import g, make_response, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import User


STAFF_ACCESS_LEVEL = 1
MANAGER_ACCESS_LEVEL = 4
ADMIN_ACCESS_LEVEL = 5


def current_user():
    """Return the user loaded by ``access_level_required`` for this request."""
    return g.current_user


def access_level_required(
    minimum_access_level=STAFF_ACCESS_LEVEL, *, method_levels=None
):
    """Require a valid JWT and the configured access level for the HTTP method.

    ``method_levels`` lets a combined GET/PATCH/DELETE route remain readable by all
    authenticated staff while reserving its mutations for managers or admins.
    """
    required_by_method = {
        method.upper(): level for method, level in (method_levels or {}).items()
    }

    def decorator(view_function):
        @wraps(view_function)
        @jwt_required()
        def authorized_view(*args, **kwargs):
            identity = get_jwt_identity()
            try:
                user_id = int(identity)
            except (TypeError, ValueError):
                return make_response({"message": "Invalid session identity"}, 401)

            user = db.session.get(User, user_id)
            if user is None:
                return make_response({"message": "User account no longer exists"}, 401)

            required_level = required_by_method.get(
                request.method, minimum_access_level
            )
            if user.role is None or user.role.access_level < required_level:
                return make_response({"message": "Insufficient permissions"}, 403)

            g.current_user = user
            return view_function(*args, **kwargs)

        return authorized_view

    return decorator
