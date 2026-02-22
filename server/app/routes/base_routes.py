from flask import Blueprint, make_response
from datetime import datetime, timezone

base_bp = Blueprint("base_bp", __name__)


@base_bp.route("/")
def index():
    return "<h1>Server is running</h1>"


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
