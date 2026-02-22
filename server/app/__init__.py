from flask import Flask
from sqlalchemy.exc import IntegrityError
from config import Config
from .extensions import db, migrate, api, bcrypt, cors, jwt
from .routes import register_blueprints


def create_app(config_overrides=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config_overrides:
        app.config.update(config_overrides)
    app.url_map.strict_slashes = False

    db.init_app(app)
    migrate.init_app(app, db)
    api.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app)
    jwt.init_app(app)

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

    return app
