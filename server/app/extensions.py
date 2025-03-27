from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from sqlalchemy import MetaData
from flask_jwt_extended import JWTManager

metadata = MetaData(
    naming_convention={
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    }
)

db = SQLAlchemy(metadata=metadata)
migrate = Migrate()
api = Api(prefix="/api")
bcrypt = Bcrypt()
cors = CORS
jwt = JWTManager()