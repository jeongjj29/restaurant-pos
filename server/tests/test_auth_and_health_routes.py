import os
import tempfile
import unittest
from unittest.mock import patch

from sqlalchemy.exc import SQLAlchemyError

from app import create_app
from app.extensions import db
from app.models import Role, TokenBlockList, User


class AuthAndHealthRoutesTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fd, cls.db_path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        cls.app = create_app(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": f"sqlite:///{cls.db_path}",
                "JWT_SECRET_KEY": "test-jwt-secret",
                "JWT_TOKEN_LOCATION": ["cookies"],
                "JWT_COOKIE_CSRF_PROTECT": True,
                "JWT_COOKIE_SECURE": False,
                "MIN_PASSWORD_LENGTH": 8,
            }
        )

        with cls.app.app_context():
            db.create_all()
            role = Role(name="Admin", access_level=5)
            db.session.add(role)
            db.session.flush()

            user = User(
                username="manager01",
                first_name="Alice",
                last_name="Smith",
                email="alice@example.com",
                phone_number="1234567890",
                role_id=role.id,
            )
            user.password_hash = "secure-password"
            db.session.add(user)
            db.session.commit()

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            db.session.remove()
            db.drop_all()
        os.remove(cls.db_path)

    def login(self, client):
        response = client.post(
            "/api/auth/login",
            json={"username": "manager01", "password": "secure-password"},
        )
        self.assertEqual(response.status_code, 200)
        return response

    def test_health_endpoint_returns_json_payload(self):
        response = self.app.test_client().get("/api/health")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "ok")
        self.assertEqual(payload["service"], "restaurant-pos-server")
        self.assertIn("timestamp_utc", payload)

    def test_login_me_logout_and_token_revocation_use_secure_cookie_contract(self):
        client = self.app.test_client()
        login_response = self.login(client)
        login_payload = login_response.get_json()
        self.assertEqual(login_payload["user"]["username"], "manager01")
        self.assertNotIn("access_token", login_payload)

        access_cookie = client.get_cookie("access_token_cookie")
        csrf_cookie = client.get_cookie("csrf_access_token")
        self.assertIsNotNone(access_cookie)
        self.assertIsNotNone(csrf_cookie)

        me_response = client.get("/api/auth/me")
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.get_json()["user"]["username"], "manager01")

        protected_response = client.get("/api/auth/protected")
        self.assertEqual(protected_response.status_code, 200)
        self.assertEqual(protected_response.get_json()["message"], "Hello, manager01")

        logout_response = client.post(
            "/api/auth/logout", headers={"X-CSRF-TOKEN": csrf_cookie.value}
        )
        self.assertEqual(logout_response.status_code, 200)
        self.assertIsNone(client.get_cookie("access_token_cookie"))
        self.assertIsNone(client.get_cookie("csrf_access_token"))

        with self.app.app_context():
            self.assertEqual(TokenBlockList.query.count(), 1)

        revoked_client = self.app.test_client()
        revoked_client.set_cookie("access_token_cookie", access_cookie.value)
        revoked_response = revoked_client.get("/api/auth/me")
        self.assertEqual(revoked_response.status_code, 401)
        self.assertEqual(
            revoked_response.get_json()["description"], "The token has been revoked"
        )

    def test_logout_rejects_missing_csrf_token(self):
        client = self.app.test_client()
        self.login(client)

        response = client.post("/api/auth/logout")
        self.assertEqual(response.status_code, 401)

        csrf_cookie = client.get_cookie("csrf_access_token")
        cleanup_response = client.post(
            "/api/auth/logout", headers={"X-CSRF-TOKEN": csrf_cookie.value}
        )
        self.assertEqual(cleanup_response.status_code, 200)

    def test_logout_clears_cookies_when_revocation_storage_fails(self):
        client = self.app.test_client()
        self.login(client)
        csrf_cookie = client.get_cookie("csrf_access_token")

        with patch(
            "sqlalchemy.orm.Session.commit",
            side_effect=SQLAlchemyError("database unavailable"),
        ):
            response = client.post(
                "/api/auth/logout", headers={"X-CSRF-TOKEN": csrf_cookie.value}
            )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.get_json()["message"],
            "Signed out locally, but session revocation could not be recorded",
        )
        self.assertIsNone(client.get_cookie("access_token_cookie"))
        self.assertIsNone(client.get_cookie("csrf_access_token"))

    def test_login_requires_username_and_password(self):
        response = self.app.test_client().post(
            "/api/auth/login", json={"username": "manager01"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["message"], "Username and password are required"
        )

    def test_login_rejects_invalid_credentials(self):
        client = self.app.test_client()
        response = client.post(
            "/api/auth/login",
            json={"username": "manager01", "password": "wrong-password"},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["message"], "Invalid credentials")
        self.assertIsNone(client.get_cookie("access_token_cookie"))

    def test_login_rejects_non_string_credentials_without_a_server_error(self):
        client = self.app.test_client()
        for payload in (
            {"username": 123, "password": "password"},
            {"username": "admin", "password": ["password"]},
        ):
            with self.subTest(payload=payload):
                response = client.post("/api/auth/login", json=payload)
                self.assertEqual(response.status_code, 400)
                self.assertEqual(
                    response.get_json()["message"],
                    "Username and password must be strings",
                )

    def test_session_endpoints_require_cookie(self):
        client = self.app.test_client()
        for path in ("/api/auth/me", "/api/auth/protected"):
            with self.subTest(path=path):
                response = client.get(path)
                self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
