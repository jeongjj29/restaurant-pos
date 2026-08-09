import os
import tempfile
import unittest

from app import create_app
from app.extensions import db
from app.models import MenuCategory, MenuItem, Order, OrderItem, Role, Table, User


class AtomicOrderCreationTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fd, cls.db_path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        cls.app = create_app(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": f"sqlite:///{cls.db_path}",
                "JWT_SECRET_KEY": "atomic-order-test-secret",
                "JWT_TOKEN_LOCATION": ["cookies"],
                "JWT_COOKIE_CSRF_PROTECT": True,
                "JWT_COOKIE_SECURE": False,
                "MIN_PASSWORD_LENGTH": 8,
                "SALES_TAX_RATE": "0.10",
            }
        )
        cls.client = cls.app.test_client()

        with cls.app.app_context():
            db.create_all()
            role = Role(name="Server", access_level=2)
            user = User(
                username="server01",
                first_name="Server",
                last_name="Tester",
                email="server01@example.com",
                role=role,
                password_hash="secure-password",
            )
            category = MenuCategory(name="Entrees")
            table = Table(number=1, capacity=4)
            db.session.add_all([role, user, category, table])
            db.session.flush()

            first_item = MenuItem(name="Bibimbap", price=10, category_id=category.id)
            second_item = MenuItem(
                name="Mandu Plate", price=5.25, category_id=category.id
            )
            db.session.add_all([first_item, second_item])
            db.session.flush()

            cls.user_id = user.id
            cls.table_id = table.id
            cls.first_item_id = first_item.id
            cls.second_item_id = second_item.id
            db.session.commit()

        login_response = cls.client.post(
            "/api/auth/login",
            json={"username": "server01", "password": "secure-password"},
        )
        if login_response.status_code != 200:
            raise RuntimeError("Could not authenticate atomic order tests")
        csrf_cookie = cls.client.get_cookie("csrf_access_token")
        cls.client.environ_base["HTTP_X_CSRF_TOKEN"] = csrf_cookie.value

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            db.session.remove()
            db.drop_all()
        os.remove(cls.db_path)

    def order_payload(self, **overrides):
        payload = {
            "type": "take_out",
            "items": [{"menu_item_id": self.first_item_id, "quantity": 1}],
        }
        payload.update(overrides)
        return payload

    def test_config_requires_authentication_and_returns_server_tax(self):
        unauthenticated = self.app.test_client().get("/api/config")
        self.assertEqual(unauthenticated.status_code, 401)

        response = self.client.get("/api/config")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"sales_tax_rate": 0.1})

    def test_dine_in_order_locks_table_occupancy_and_take_out_has_no_table(self):
        missing_table = self.client.post(
            "/api/orders",
            json=self.order_payload(type="dine_in"),
        )
        self.assertEqual(missing_table.status_code, 400)
        self.assertEqual(
            missing_table.get_json()["message"], "Dine-in orders require a table"
        )

        unknown_table = self.client.post(
            "/api/orders",
            json=self.order_payload(type="dine_in", table_id=99999),
        )
        self.assertEqual(unknown_table.status_code, 400)
        self.assertEqual(unknown_table.get_json()["message"], "Table does not exist")

        first_response = self.client.post(
            "/api/orders",
            json=self.order_payload(type="dine_in", table_id=self.table_id),
        )
        self.assertEqual(first_response.status_code, 201)
        self.assertEqual(first_response.get_json()["table_id"], self.table_id)

        occupied_response = self.client.post(
            "/api/orders",
            json=self.order_payload(type="dine_in", table_id=self.table_id),
        )
        self.assertEqual(occupied_response.status_code, 400)
        self.assertEqual(
            occupied_response.get_json()["message"],
            "Table already has an open order",
        )

        take_out_with_table = self.client.post(
            "/api/orders",
            json=self.order_payload(table_id=self.table_id),
        )
        self.assertEqual(take_out_with_table.status_code, 400)
        self.assertEqual(
            take_out_with_table.get_json()["message"],
            "Take-out orders cannot have a table",
        )

        with self.app.app_context():
            self.assertEqual(
                Order.query.filter_by(table_id=self.table_id, status="open").count(),
                1,
            )

    def test_order_requires_non_empty_strictly_shaped_items(self):
        for payload, expected_message in (
            ({"type": "take_out"}, "Missing required field: items"),
            (
                self.order_payload(items=[]),
                "Order items must be a non-empty list",
            ),
            (
                self.order_payload(
                    items=[
                        {
                            "menu_item_id": self.first_item_id,
                            "quantity": 1,
                            "price": 0.01,
                        }
                    ]
                ),
                "Unexpected order item fields: price",
            ),
            (
                {**self.order_payload(), "total_price": 0.01},
                "Unexpected fields: total_price",
            ),
        ):
            with self.subTest(payload=payload):
                response = self.client.post("/api/orders", json=payload)
                self.assertEqual(response.status_code, 400)
                self.assertEqual(response.get_json()["message"], expected_message)

    def test_order_and_all_items_are_created_atomically_with_snapshot_prices(self):
        response = self.client.post(
            "/api/orders",
            json=self.order_payload(
                items=[
                    {"menu_item_id": self.first_item_id, "quantity": 2},
                    {"menu_item_id": self.second_item_id, "quantity": 3},
                ]
            ),
        )
        self.assertEqual(response.status_code, 201)
        order = response.get_json()
        self.assertEqual(order["status"], "open")
        self.assertEqual(order["user_id"], self.user_id)
        self.assertIsNone(order["table_id"])
        self.assertEqual(order["sales_tax"], 0.1)
        self.assertEqual(order["total_price"], 39.33)
        self.assertEqual(
            sorted((item["price"], item["quantity"]) for item in order["order_items"]),
            [(5.25, 3), (10.0, 2)],
        )

        with self.app.app_context():
            persisted_order = db.session.get(Order, order["id"])
            self.assertEqual(len(persisted_order.order_items), 2)
            self.assertEqual(float(persisted_order.total_price), 39.33)

    def test_invalid_item_rolls_back_the_entire_order(self):
        with self.app.app_context():
            order_count = Order.query.count()
            item_count = OrderItem.query.count()

        missing_item = self.client.post(
            "/api/orders",
            json=self.order_payload(
                items=[
                    {"menu_item_id": self.first_item_id, "quantity": 1},
                    {"menu_item_id": 99999, "quantity": 1},
                ]
            ),
        )
        self.assertEqual(missing_item.status_code, 400)
        self.assertEqual(
            missing_item.get_json()["message"], "Menu item 99999 does not exist"
        )

        invalid_quantity = self.client.post(
            "/api/orders",
            json=self.order_payload(
                items=[{"menu_item_id": self.first_item_id, "quantity": 0}]
            ),
        )
        self.assertEqual(invalid_quantity.status_code, 400)
        self.assertEqual(invalid_quantity.get_json()["message"], "Invalid quantity")

        with self.app.app_context():
            self.assertEqual(Order.query.count(), order_count)
            self.assertEqual(OrderItem.query.count(), item_count)


if __name__ == "__main__":
    unittest.main()
