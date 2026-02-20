import os
import tempfile
import unittest

from app import create_app
from app.extensions import db
from app.models import Role, User


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
            }
        )
        cls.client = cls.app.test_client()

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

    def test_health_endpoint_returns_json_payload(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "ok")
        self.assertEqual(payload["service"], "restaurant-pos-server")
        self.assertIn("timestamp_utc", payload)

    def test_login_protected_logout_and_token_revocation(self):
        login_response = self.client.post(
            "/api/auth/login",
            json={"username": "manager01", "password": "secure-password"},
        )
        self.assertEqual(login_response.status_code, 200)
        token = login_response.get_json()["access_token"]
        auth_header = {"Authorization": f"Bearer {token}"}

        protected_response = self.client.get("/api/auth/protected", headers=auth_header)
        self.assertEqual(protected_response.status_code, 200)
        self.assertEqual(
            protected_response.get_json()["message"], "Hello, manager01"
        )

        logout_response = self.client.post("/api/auth/logout", headers=auth_header)
        self.assertEqual(logout_response.status_code, 200)

        revoked_response = self.client.get("/api/auth/protected", headers=auth_header)
        self.assertEqual(revoked_response.status_code, 401)
        self.assertEqual(
            revoked_response.get_json()["description"], "The token has been revoked"
        )


if __name__ == "__main__":
    unittest.main()
