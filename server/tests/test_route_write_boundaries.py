import os
import tempfile
import unittest

from app import create_app
from app.extensions import db
from app.models import Discount, MenuCategory, MenuItem, Role, Table, User


class RouteWriteBoundariesTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fd, cls.db_path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        cls.app = create_app(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": f"sqlite:///{cls.db_path}",
                "JWT_SECRET_KEY": "write-boundary-test-secret",
                "JWT_TOKEN_LOCATION": ["cookies"],
                "JWT_COOKIE_CSRF_PROTECT": True,
                "JWT_COOKIE_SECURE": False,
                "MIN_PASSWORD_LENGTH": 8,
            }
        )
        cls.client = cls.app.test_client()

        with cls.app.app_context():
            db.create_all()
            admin_role = Role(name="Admin", access_level=5)
            staff_role = Role(name="Server", access_level=2)
            category = MenuCategory(name="Entrees", secondary_name="Mains")
            table = Table(number=10, capacity=4, location_x=1, location_y=1)
            discount = Discount(name="Lunch", amount=2)
            db.session.add_all([admin_role, staff_role, category, table, discount])
            db.session.flush()

            menu_item = MenuItem(name="Bibimbap", price=18, category_id=category.id)
            admin = User(
                username="admin01",
                first_name="Admin",
                last_name="Tester",
                email="admin01@example.com",
                role_id=admin_role.id,
                password_hash="secure-password",
            )
            employee = User(
                username="server01",
                first_name="Server",
                last_name="Tester",
                email="server01@example.com",
                role_id=staff_role.id,
                password_hash="secure-password",
            )
            db.session.add_all([menu_item, admin, employee])
            db.session.flush()

            cls.admin_role_id = admin_role.id
            cls.staff_role_id = staff_role.id
            cls.category_id = category.id
            cls.table_id = table.id
            cls.discount_id = discount.id
            cls.menu_item_id = menu_item.id
            cls.employee_id = employee.id
            db.session.commit()

        login_response = cls.client.post(
            "/api/auth/login",
            json={"username": "admin01", "password": "secure-password"},
        )
        if login_response.status_code != 200:
            raise RuntimeError("Could not authenticate route write boundary tests")
        csrf_cookie = cls.client.get_cookie("csrf_access_token")
        cls.client.environ_base["HTTP_X_CSRF_TOKEN"] = csrf_cookie.value

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            db.session.remove()
            db.drop_all()
        os.remove(cls.db_path)

    def test_create_routes_reject_server_managed_and_relationship_fields(self):
        attempts = (
            (
                "/api/discounts",
                {"name": "Evening", "amount": 3, "id": 999},
                "id",
            ),
            (
                "/api/menu_categories",
                {"name": "Desserts", "menu_items": []},
                "menu_items",
            ),
            (
                "/api/menu_items",
                {
                    "name": "Hotteok",
                    "price": 8,
                    "category_id": self.category_id,
                    "menu_category": {},
                },
                "menu_category",
            ),
            (
                "/api/tables",
                {"number": 11, "capacity": 4, "orders": []},
                "orders",
            ),
            (
                "/api/roles",
                {"name": "Auditor", "access_level": 1, "users": []},
                "users",
            ),
            (
                "/api/users",
                {
                    "username": "newuser",
                    "first_name": "New",
                    "last_name": "User",
                    "email": "newuser@example.com",
                    "role_id": self.staff_role_id,
                    "password": "secure-password",
                    "password_hash": "injected-hash",
                },
                "password_hash",
            ),
        )

        for path, payload, unexpected_field in attempts:
            with self.subTest(path=path, unexpected_field=unexpected_field):
                response = self.client.post(path, json=payload)
                self.assertEqual(response.status_code, 400)
                self.assertEqual(
                    response.get_json()["message"],
                    f"Unexpected fields: {unexpected_field}",
                )

    def test_write_routes_require_an_object_shaped_json_body(self):
        endpoints = (
            ("POST", "/api/discounts"),
            ("PATCH", f"/api/discounts/{self.discount_id}"),
            ("POST", "/api/menu_categories"),
            ("PATCH", f"/api/menu_categories/{self.category_id}"),
            ("POST", "/api/menu_items"),
            ("PATCH", f"/api/menu_items/{self.menu_item_id}"),
            ("POST", "/api/tables"),
            ("PATCH", f"/api/tables/{self.table_id}"),
            ("POST", "/api/roles"),
            ("PATCH", f"/api/roles/{self.staff_role_id}"),
            ("POST", "/api/users"),
            ("PATCH", f"/api/users/{self.employee_id}"),
        )

        for method, path in endpoints:
            with self.subTest(method=method, path=path):
                response = self.client.open(path, method=method, json=[])
                self.assertEqual(response.status_code, 400)
                self.assertEqual(
                    response.get_json()["message"],
                    "Request body must be a JSON object",
                )

    def test_patch_rejects_unknown_fields_before_changing_valid_fields(self):
        attempts = (
            (
                f"/api/discounts/{self.discount_id}",
                {"name": "Hacked Discount", "id": 999},
                "id",
            ),
            (
                f"/api/menu_categories/{self.category_id}",
                {"secondary_name": "Hacked", "menu_items": []},
                "menu_items",
            ),
            (
                f"/api/menu_items/{self.menu_item_id}",
                {"price": 1, "menu_category": {}},
                "menu_category",
            ),
            (
                f"/api/tables/{self.table_id}",
                {"capacity": 99, "orders": []},
                "orders",
            ),
            (
                f"/api/roles/{self.staff_role_id}",
                {"access_level": 5, "users": []},
                "users",
            ),
            (
                f"/api/users/{self.employee_id}",
                {"first_name": "Hacked", "access_level": 5, "role": {}},
                "access_level, role",
            ),
        )

        for path, payload, unexpected_fields in attempts:
            with self.subTest(path=path):
                response = self.client.patch(path, json=payload)
                self.assertEqual(response.status_code, 400)
                self.assertEqual(
                    response.get_json()["message"],
                    f"Unexpected fields: {unexpected_fields}",
                )

        with self.app.app_context():
            self.assertEqual(db.session.get(Discount, self.discount_id).name, "Lunch")
            self.assertEqual(
                db.session.get(MenuCategory, self.category_id).secondary_name,
                "Mains",
            )
            self.assertEqual(db.session.get(MenuItem, self.menu_item_id).price, 18)
            self.assertEqual(db.session.get(Table, self.table_id).capacity, 4)
            self.assertEqual(db.session.get(Role, self.staff_role_id).access_level, 2)
            employee = db.session.get(User, self.employee_id)
            self.assertEqual(employee.first_name, "Server")
            self.assertEqual(employee.role_id, self.staff_role_id)

    def test_valid_allowlisted_patches_succeed(self):
        patches = (
            (
                f"/api/discounts/{self.discount_id}",
                {"name": "Dinner", "amount": 3},
                {"name": "Dinner", "amount": 3.0},
            ),
            (
                f"/api/menu_categories/{self.category_id}",
                {"secondary_name": "Dinner"},
                {"secondary_name": "Dinner"},
            ),
            (
                f"/api/menu_items/{self.menu_item_id}",
                {"description": "House specialty", "price": 19},
                {"description": "House specialty", "price": 19.0},
            ),
            (
                f"/api/tables/{self.table_id}",
                {"capacity": 6, "location_x": 2},
                {"capacity": 6, "location_x": 2},
            ),
            (
                f"/api/roles/{self.staff_role_id}",
                {"access_level": 3},
                {"access_level": 3},
            ),
            (
                f"/api/users/{self.employee_id}",
                {"first_name": "Updated", "phone_number": "2125550100"},
                {"first_name": "Updated", "phone_number": "2125550100"},
            ),
        )

        for path, payload, expected_fields in patches:
            with self.subTest(path=path):
                response = self.client.patch(path, json=payload)
                self.assertEqual(response.status_code, 200)
                response_payload = response.get_json()
                for field, expected_value in expected_fields.items():
                    self.assertEqual(response_payload[field], expected_value)


if __name__ == "__main__":
    unittest.main()
