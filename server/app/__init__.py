from flask import Flask
from config import Config
from .extensions import db, migrate, api, bcrypt, cors, jwt
from .routes import register_blueprints

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    api.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app)
    jwt.init_app(app)


    register_blueprints(app)

    return app