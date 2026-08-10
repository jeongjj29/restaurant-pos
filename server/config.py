import os
from datetime import timedelta
from decimal import Decimal, InvalidOperation

from dotenv import load_dotenv


load_dotenv()

DEVELOPMENT_JWT_SECRET = "dev-only-change-me"


def env_bool(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    normalized_value = value.strip().lower()
    if normalized_value in {"1", "true", "yes", "on"}:
        return True
    if normalized_value in {"0", "false", "no", "off"}:
        return False
    raise RuntimeError(f"{name} must be a boolean")


def env_int(name, default):
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError as error:
        raise RuntimeError(f"{name} must be an integer") from error


def env_list(name):
    return tuple(
        value.strip() for value in os.getenv(name, "").split(",") if value.strip()
    )


def normalize_database_url(value):
    if value.startswith("postgres://"):
        return value.replace("postgres://", "postgresql+psycopg://", 1)
    if value.startswith("postgresql://"):
        return value.replace("postgresql://", "postgresql+psycopg://", 1)
    return value


class Config:
    ENVIRONMENT = os.getenv("APP_ENV", "development").strip().lower()
    PRODUCTION = ENVIRONMENT == "production"

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", DEVELOPMENT_JWT_SECRET)
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_SECURE = env_bool("JWT_COOKIE_SECURE", PRODUCTION)
    JWT_COOKIE_SAMESITE = os.getenv("JWT_COOKIE_SAMESITE", "Lax")
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_SESSION_COOKIE = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=env_int("JWT_ACCESS_TOKEN_MINUTES", 60 if PRODUCTION else 480)
    )

    SQLALCHEMY_DATABASE_URI = normalize_database_url(
        os.getenv("DATABASE_URL", "sqlite:///restaurant_pos.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": env_int("DATABASE_POOL_RECYCLE_SECONDS", 300),
    }

    CORS_ORIGINS = env_list("CORS_ORIGINS")
    TRUST_PROXY_COUNT = env_int("TRUST_PROXY_COUNT", 0)
    TRUSTED_HOSTS = list(env_list("TRUSTED_HOSTS")) or None
    CLIENT_DIST_DIR = os.getenv("CLIENT_DIST_DIR")

    MAX_CONTENT_LENGTH = env_int("MAX_CONTENT_LENGTH", 1_048_576)
    SALES_TAX_RATE = os.getenv("SALES_TAX_RATE", "0.08875")
    MIN_PASSWORD_LENGTH = env_int("MIN_PASSWORD_LENGTH", 12 if PRODUCTION else 8)
    ALLOW_DEMO_SEED = env_bool("ALLOW_DEMO_SEED", False)
    ALLOW_DEMO_RESET = env_bool("ALLOW_DEMO_RESET", False)

    RATELIMIT_ENABLED = env_bool("RATELIMIT_ENABLED", PRODUCTION)
    RATELIMIT_DEFAULT = os.getenv("API_RATE_LIMIT", "300 per minute")
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_HEADERS_ENABLED = True
    LOGIN_RATE_LIMIT = os.getenv("LOGIN_RATE_LIMIT", "10 per minute")

    SESSION_COOKIE_SECURE = PRODUCTION
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    PREFERRED_URL_SCHEME = "https" if PRODUCTION else "http"


def validate_runtime_config(config):
    if config.get("JWT_COOKIE_SAMESITE") not in {"Lax", "Strict", "None"}:
        raise RuntimeError("JWT_COOKIE_SAMESITE must be Lax, Strict, or None")

    try:
        sales_tax_rate = Decimal(str(config.get("SALES_TAX_RATE", "0.08875")))
    except (InvalidOperation, TypeError, ValueError) as error:
        raise RuntimeError("SALES_TAX_RATE must be a decimal") from error
    if not sales_tax_rate.is_finite() or not Decimal("0") <= sales_tax_rate <= Decimal(
        "1"
    ):
        raise RuntimeError("SALES_TAX_RATE must be between 0 and 1")

    if int(config.get("MIN_PASSWORD_LENGTH", 8)) < 8:
        raise RuntimeError("MIN_PASSWORD_LENGTH must be at least 8")
    if (
        config.get("JWT_ACCESS_TOKEN_EXPIRES", timedelta(minutes=480)).total_seconds()
        <= 0
    ):
        raise RuntimeError("JWT_ACCESS_TOKEN_MINUTES must be positive")
    if int(config.get("TRUST_PROXY_COUNT", 0)) < 0:
        raise RuntimeError("TRUST_PROXY_COUNT cannot be negative")
    if int(config.get("MAX_CONTENT_LENGTH", 1_048_576)) < 1:
        raise RuntimeError("MAX_CONTENT_LENGTH must be positive")

    if not config.get("PRODUCTION"):
        return

    errors = []
    secret = str(config.get("JWT_SECRET_KEY") or "")
    database_url = str(config.get("SQLALCHEMY_DATABASE_URI") or "")

    if secret == DEVELOPMENT_JWT_SECRET or len(secret) < 32:
        errors.append("JWT_SECRET_KEY must be a unique value of at least 32 characters")
    if not database_url.startswith("postgresql+psycopg://"):
        errors.append("DATABASE_URL must use PostgreSQL with the psycopg driver")
    if not config.get("JWT_COOKIE_SECURE"):
        errors.append("JWT_COOKIE_SECURE must be enabled in production")
    if any("*" in origin for origin in config.get("CORS_ORIGINS", ())):
        errors.append("CORS_ORIGINS cannot contain a wildcard in production")
    if config.get("JWT_COOKIE_SAMESITE") == "None" and not config.get(
        "JWT_COOKIE_SECURE"
    ):
        errors.append("SameSite=None cookies require JWT_COOKIE_SECURE")

    if errors:
        raise RuntimeError("Invalid production configuration: " + "; ".join(errors))
