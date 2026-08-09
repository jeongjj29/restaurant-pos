import os
import tempfile
import unittest
from datetime import timedelta
from pathlib import Path
from unittest.mock import patch

from app import create_app
from config import env_bool, normalize_database_url, validate_runtime_config


class ProductionConfigTestCase(unittest.TestCase):
    def valid_config(self, **overrides):
        config = {
            "PRODUCTION": False,
            "JWT_COOKIE_SAMESITE": "Lax",
            "JWT_ACCESS_TOKEN_EXPIRES": timedelta(hours=1),
            "MIN_PASSWORD_LENGTH": 12,
            "TRUST_PROXY_COUNT": 0,
            "MAX_CONTENT_LENGTH": 1_048_576,
            "SALES_TAX_RATE": "0.08875",
        }
        config.update(overrides)
        return config

    def test_boolean_environment_values_are_strict(self):
        with patch.dict(os.environ, {"STRICT_BOOL": "not-a-boolean"}):
            with self.assertRaisesRegex(RuntimeError, "STRICT_BOOL must be a boolean"):
                env_bool("STRICT_BOOL")

    def test_normalizes_managed_postgres_urls_for_psycopg(self):
        self.assertEqual(
            normalize_database_url("postgres://user:pass@db.example/pos"),
            "postgresql+psycopg://user:pass@db.example/pos",
        )
        self.assertEqual(
            normalize_database_url("postgresql://user:pass@db.example/pos"),
            "postgresql+psycopg://user:pass@db.example/pos",
        )

    def test_rejects_insecure_production_configuration(self):
        with self.assertRaisesRegex(RuntimeError, "Invalid production configuration"):
            validate_runtime_config(
                {
                    "PRODUCTION": True,
                    "JWT_SECRET_KEY": "too-short",
                    "SQLALCHEMY_DATABASE_URI": "sqlite:///production.db",
                    "JWT_COOKIE_SECURE": False,
                    "JWT_COOKIE_SAMESITE": "Lax",
                }
            )

    def test_rejects_wildcard_cors_patterns_in_production(self):
        with self.assertRaisesRegex(RuntimeError, "wildcard"):
            validate_runtime_config(
                self.valid_config(
                    PRODUCTION=True,
                    JWT_SECRET_KEY="a-unique-secret-that-is-longer-than-32-characters",
                    SQLALCHEMY_DATABASE_URI=(
                        "postgresql+psycopg://user:pass@example.test/pos"
                    ),
                    JWT_COOKIE_SECURE=True,
                    CORS_ORIGINS=("https://*.example.com",),
                )
            )

    def test_rejects_non_finite_tax_and_negative_proxy_count(self):
        with self.assertRaisesRegex(RuntimeError, "SALES_TAX_RATE"):
            validate_runtime_config(self.valid_config(SALES_TAX_RATE="NaN"))

        with self.assertRaisesRegex(RuntimeError, "TRUST_PROXY_COUNT"):
            validate_runtime_config(self.valid_config(TRUST_PROXY_COUNT=-1))

    def test_api_responses_include_security_and_cache_headers(self):
        app = create_app(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": "sqlite://",
                "JWT_SECRET_KEY": "test-secret",
            }
        )

        response = app.test_client().get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Cache-Control"], "no-store")
        self.assertEqual(response.headers["X-Content-Type-Options"], "nosniff")
        self.assertEqual(response.headers["X-Frame-Options"], "DENY")
        self.assertIn("default-src 'self'", response.headers["Content-Security-Policy"])
        self.assertNotIn("Strict-Transport-Security", response.headers)

    def test_serves_spa_deep_links_and_keeps_unknown_api_routes_json(self):
        with tempfile.TemporaryDirectory() as temp_directory:
            dist_directory = Path(temp_directory)
            (dist_directory / "index.html").write_text(
                "<html><body>Restaurant POS</body></html>", encoding="utf-8"
            )
            app = create_app(
                {
                    "TESTING": True,
                    "SQLALCHEMY_DATABASE_URI": "sqlite://",
                    "JWT_SECRET_KEY": "test-secret",
                    "CLIENT_DIST_DIR": str(dist_directory),
                }
            )
            client = app.test_client()

            deep_link = client.get("/orders/payment?orderId=12")
            missing_api = client.get("/api/not-a-real-route")

            self.assertEqual(deep_link.status_code, 200)
            self.assertIn(b"Restaurant POS", deep_link.data)
            self.assertEqual(deep_link.headers["Cache-Control"], "no-cache")
            self.assertEqual(missing_api.status_code, 404)
            self.assertEqual(missing_api.get_json()["message"], "Resource not found")
            deep_link.close()
            missing_api.close()


if __name__ == "__main__":
    unittest.main()
