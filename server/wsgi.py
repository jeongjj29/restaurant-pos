"""Production WSGI entry point for the API and compiled Vite client."""

import os
import re
from pathlib import Path

from whitenoise import WhiteNoise

from app import create_app


CLIENT_DIST_DIR = Path(
    os.getenv("CLIENT_DIST_DIR", Path(__file__).resolve().parent / "static")
).resolve()
VITE_ASSET_PATTERN = re.compile(r"^/assets/.+-[A-Za-z0-9_-]{8,}\.[^/]+$")


def _is_immutable_vite_asset(path, url):
    return bool(VITE_ASSET_PATTERN.match(url))


def _add_static_security_headers(headers, path, url):
    headers["Content-Security-Policy"] = (
        "default-src 'self'; base-uri 'self'; connect-src 'self'; "
        "font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; "
        "img-src 'self' data:; object-src 'none'; script-src 'self'; "
        "style-src 'self' 'unsafe-inline'"
    )
    headers["Cross-Origin-Opener-Policy"] = "same-origin"
    headers["Cross-Origin-Resource-Policy"] = "same-origin"
    headers["Permissions-Policy"] = "camera=(), geolocation=(), microphone=()"
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    headers["X-Content-Type-Options"] = "nosniff"
    headers["X-Frame-Options"] = "DENY"
    if path.endswith("index.html"):
        headers["Cache-Control"] = "no-cache"
    if os.getenv("APP_ENV", "development").strip().lower() == "production":
        headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"


app = create_app({"CLIENT_DIST_DIR": str(CLIENT_DIST_DIR)})
application = WhiteNoise(
    app,
    root=str(CLIENT_DIST_DIR),
    add_headers_function=_add_static_security_headers,
    immutable_file_test=_is_immutable_vite_asset,
)
