import os
import tempfile
import unittest
from unittest.mock import patch

from sqlalchemy import inspect

from app import create_app
from app.extensions import db
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
