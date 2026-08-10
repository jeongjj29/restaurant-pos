from flask import Flask, request
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.middleware.proxy_fix import ProxyFix

from config import Config, validate_runtime_config
from .extensions import db, migrate, api, bcrypt, cors, jwt, limiter
from .routes import register_blueprints


def create_app(config_overrides=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config_overrides:
        app.config.update(config_overrides)
    validate_runtime_config(app.config)
    app.url_map.strict_slashes = False

    proxy_count = app.config["TRUST_PROXY_COUNT"]
    if proxy_count:
        app.wsgi_app = ProxyFix(
            app.wsgi_app,
            x_for=proxy_count,
            x_proto=proxy_count,
            x_host=proxy_count,
        )

    db.init_app(app)
    migrate.init_app(app, db)
    api.init_app(app)
    bcrypt.init_app(app)
    if app.config["CORS_ORIGINS"]:
        cors.init_app(
            app,
            resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
            supports_credentials=True,
        )
    jwt.init_app(app)
    limiter.init_app(app)

    register_blueprints(app)

    @app.errorhandler(ValueError)
    def handle_value_error(error):
        return {"message": str(error)}, 400

    @app.errorhandler(KeyError)
    def handle_key_error(error):
        missing_key = error.args[0] if error.args else "unknown"
        return {"message": f"Missing required field: {missing_key}"}, 400

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        db.session.rollback()
        return {"message": "Database integrity error"}, 400

    @app.errorhandler(RequestEntityTooLarge)
    def handle_request_too_large(error):
        return {"message": "Request body is too large"}, 413

    @app.errorhandler(429)
    def handle_rate_limit(error):
        return {"message": "Too many requests"}, 429

    @app.errorhandler(404)
    def handle_not_found(error):
        if request.path.startswith("/api/"):
            return {"message": "Resource not found"}, 404
        return error

    @app.errorhandler(500)
    def handle_internal_error(error):
        app.logger.error("Unhandled application error", exc_info=True)
        return {"message": "Internal server error"}, 500

    @app.after_request
    def add_security_headers(response):
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; base-uri 'self'; connect-src 'self'; "
            "font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; "
            "img-src 'self' data:; object-src 'none'; script-src 'self'; "
            "style-src 'self' 'unsafe-inline'"
        )
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), geolocation=(), microphone=()"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        if request.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"
        if app.config["PRODUCTION"]:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )
        return response

    return app
