import os
import tempfile
import unittest
from unittest.mock import patch

from sqlalchemy import inspect

from app import create_app
from app.extensions import db
from app.models import MenuItem, Order, Payment, Role, Table, User
from manage import register_cli_commands


class ManageCliCommandsTestCase(unittest.TestCase):
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
        register_cli_commands(cls.app)
        cls.runner = cls.app.test_cli_runner()

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            db.session.remove()
            db.drop_all()
        os.remove(cls.db_path)

    def setUp(self):
        with self.app.app_context():
            db.create_all()

    def test_seed_command_runs_seed_data(self):
        with patch("seed.seed_data") as seed_data_mock:
            result = self.runner.invoke(args=["seed"])

        self.assertEqual(result.exit_code, 0)
        self.assertIn("Seeded the database.", result.output)
        seed_data_mock.assert_called_once()

    def test_seed_is_non_destructive_idempotent_and_demo_ready(self):
        with self.app.app_context():
            sentinel_role = Role(name="Auditor", access_level=5)
            db.session.add(sentinel_role)
            db.session.flush()
            sentinel_user = User(
                username="sentinel",
                first_name="Safe",
                last_name="User",
                email="safe@example.com",
                role=sentinel_role,
                password_hash="keep-this-password",
            )
            db.session.add(sentinel_user)
            db.session.commit()

        first_seed = self.runner.invoke(args=["seed"])
        self.assertEqual(first_seed.exit_code, 0, first_seed.output)

        with self.app.app_context():
            first_counts = {
                "roles": Role.query.count(),
                "users": User.query.count(),
                "tables": Table.query.count(),
                "menu_items": MenuItem.query.count(),
                "orders": Order.query.count(),
                "payments": Payment.query.count(),
            }

        second_seed = self.runner.invoke(args=["seed"])
        self.assertEqual(second_seed.exit_code, 0, second_seed.output)

        with self.app.app_context():
            second_counts = {
                "roles": Role.query.count(),
                "users": User.query.count(),
                "tables": Table.query.count(),
                "menu_items": MenuItem.query.count(),
                "orders": Order.query.count(),
                "payments": Payment.query.count(),
            }
            self.assertEqual(first_counts, second_counts)

            sentinel = User.query.filter_by(username="sentinel").one()
            self.assertTrue(sentinel.authenticate("keep-this-password"))

            admin = User.query.filter_by(username="admin").one()
            waiter = User.query.filter_by(username="waiter").one()
            self.assertTrue(admin.authenticate("password"))
            self.assertEqual(waiter.role.name, "Server")

            seeded_tables = Table.query.filter(
                Table.number.in_([1, 2, 3, 4, 5, 21, 22, 41, 42, 43, 44])
            ).all()
            locations = [
                (table.location_x, table.location_y) for table in seeded_tables
            ]
            self.assertEqual(len(seeded_tables), 11)
            self.assertNotIn((None, None), locations)
            self.assertEqual(len(locations), len(set(locations)))

            self.assertEqual(Order.query.filter_by(status="open").count(), 1)
            self.assertEqual(Order.query.filter_by(status="closed").count(), 1)
            self.assertEqual(Payment.query.count(), 1)

        login_response = self.app.test_client().post(
            "/api/auth/login", json={"username": "admin", "password": "password"}
        )
        self.assertEqual(login_response.status_code, 200)

    def test_dropdb_aborts_without_confirmation(self):
        result = self.runner.invoke(args=["dropdb"], input="n\n")

        self.assertEqual(result.exit_code, 0)
        self.assertIn("Aborted.", result.output)

    def test_dropdb_drops_tables_with_yes_flag(self):
        result = self.runner.invoke(args=["dropdb", "--yes"])

        self.assertEqual(result.exit_code, 0)
        self.assertIn("Dropped all tables.", result.output)
        with self.app.app_context():
            table_names = inspect(db.engine).get_table_names()
            self.assertEqual(table_names, [])

    def test_dropdb_is_blocked_in_unsafe_environment(self):
        fd, db_path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        unsafe_app = create_app(
            {
                "TESTING": False,
                "DEBUG": False,
                "SQLALCHEMY_DATABASE_URI": f"sqlite:///{db_path}",
                "JWT_SECRET_KEY": "test-jwt-secret",
            }
        )
        register_cli_commands(unsafe_app)
        runner = unsafe_app.test_cli_runner()

        try:
            with patch.dict(os.environ, {"FLASK_ENV": "production"}):
                result = runner.invoke(args=["dropdb", "--yes"])
            self.assertNotEqual(result.exit_code, 0)
            self.assertIn("Unsafe environment", result.output)
        finally:
            with unsafe_app.app_context():
                db.session.remove()
                db.drop_all()
            os.remove(db_path)


if __name__ == "__main__":
    unittest.main()
