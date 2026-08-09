from datetime import datetime, timezone
from pathlib import Path

from flask import Blueprint, abort, current_app, make_response, send_from_directory
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db


base_bp = Blueprint("base_bp", __name__)


def _client_dist_directory():
    configured_path = current_app.config.get("CLIENT_DIST_DIR")
    if not configured_path:
        return None
    return Path(configured_path).resolve()


def _send_client_file(directory, filename, *, immutable=False):
    response = make_response(send_from_directory(directory, filename))
    if immutable:
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    else:
        response.headers["Cache-Control"] = "no-cache"
    return response


@base_bp.route("/api/health")
def health():
    return make_response(
        {
            "status": "ok",
            "service": "restaurant-pos-server",
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        },
        200,
    )


@base_bp.route("/api/ready")
def ready():
    try:
        db.session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        db.session.rollback()
        current_app.logger.exception("Database readiness check failed")
        return make_response({"status": "unavailable"}, 503)

    return make_response({"status": "ready"}, 200)


@base_bp.route("/assets/<path:filename>")
def client_asset(filename):
    directory = _client_dist_directory()
    if directory is None:
        abort(404)
    return _send_client_file(directory / "assets", filename, immutable=True)


@base_bp.route("/", defaults={"path": ""})
@base_bp.route("/<path:path>")
def client_app(path):
    if path.startswith("api/"):
        abort(404)

    directory = _client_dist_directory()
    if directory is None or not (directory / "index.html").is_file():
        if not path:
            return make_response(
                {"service": "restaurant-pos-server", "status": "ok"}, 200
            )
        abort(404)

    requested_file = directory / path
    if path and requested_file.is_file():
        return _send_client_file(directory, path)
    return _send_client_file(directory, "index.html")
