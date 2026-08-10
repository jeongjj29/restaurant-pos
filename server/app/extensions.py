from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy import MetaData
from flask_jwt_extended import JWTManager

metadata = MetaData(
    naming_convention={
        "ix": "ix_%(table_name)s_%(column_0_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    }
)

db = SQLAlchemy(metadata=metadata)
migrate = Migrate()
api = Api(prefix="/api")
bcrypt = Bcrypt()
cors = CORS()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)
