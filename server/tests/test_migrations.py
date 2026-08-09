import os
import tempfile
import unittest
from pathlib import Path

from flask_migrate import upgrade
from sqlalchemy import String, inspect

from app import create_app
from app.extensions import db
from app.models import Role, TokenBlockList, User


MIGRATIONS_DIRECTORY = Path(__file__).resolve().parents[1] / "migrations"


class MigratedSchemaTestCase(unittest.TestCase):
    def test_fresh_upgrade_supports_login_logout_and_token_revocation(self):
        fd, db_path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        app = create_app(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": f"sqlite:///{db_path}",
                "JWT_SECRET_KEY": "migration-test-jwt-secret",
            }
        )

        try:
            with app.app_context():
                upgrade(directory=str(MIGRATIONS_DIRECTORY))
                table_names = inspect(db.engine).get_table_names()
                self.assertIn("token_blocklist", table_names)
                self.assertNotIn("token_block_list", table_names)
                user_columns = {
                    column["name"]: column
                    for column in inspect(db.engine).get_columns("users")
                }
                self.assertIsInstance(user_columns["phone_number"]["type"], String)

                role = Role(name="Admin", access_level=5)
                db.session.add(role)
                db.session.flush()
                user = User(
                    username="migration-admin",
                    first_name="Migration",
                    last_name="Admin",
                    email="migration-admin@example.com",
                    role=role,
                    password_hash="secure-password",
                )
                db.session.add(user)
                db.session.commit()

            client = app.test_client()
            login_response = client.post(
                "/api/auth/login",
                json={
                    "username": "migration-admin",
                    "password": "secure-password",
                },
            )
            self.assertEqual(login_response.status_code, 200)
            access_cookie = client.get_cookie("access_token_cookie")
            csrf_cookie = client.get_cookie("csrf_access_token")
            self.assertIsNotNone(access_cookie)
            self.assertIsNotNone(csrf_cookie)

            protected_response = client.get("/api/auth/protected")
            self.assertEqual(protected_response.status_code, 200)

            logout_response = client.post(
                "/api/auth/logout",
                headers={"X-CSRF-TOKEN": csrf_cookie.value},
            )
            self.assertEqual(logout_response.status_code, 200)
            with app.app_context():
                self.assertEqual(TokenBlockList.query.count(), 1)

            client.set_cookie("access_token_cookie", access_cookie.value)
            revoked_response = client.get("/api/auth/protected")
            self.assertEqual(revoked_response.status_code, 401)
        finally:
            with app.app_context():
                db.session.remove()
                db.engine.dispose()
            os.remove(db_path)

    def test_upgrade_accepts_runtime_table_created_by_legacy_seed(self):
        fd, db_path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        app = create_app(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": f"sqlite:///{db_path}",
                "JWT_SECRET_KEY": "migration-test-jwt-secret",
            }
        )

        try:
            with app.app_context():
                upgrade(
                    directory=str(MIGRATIONS_DIRECTORY),
                    revision="3e4160537594",
                )
                TokenBlockList.__table__.create(db.engine)

                upgrade(directory=str(MIGRATIONS_DIRECTORY))

                table_names = inspect(db.engine).get_table_names()
                self.assertIn("token_blocklist", table_names)
        finally:
            with app.app_context():
                db.session.remove()
                db.engine.dispose()
            os.remove(db_path)


if __name__ == "__main__":
    unittest.main()
