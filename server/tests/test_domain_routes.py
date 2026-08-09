import os
import tempfile
import unittest

from app import create_app
from app.extensions import db
from app.models import MenuCategory, MenuItem, Role, Table, User


class DomainRoutesTestCase(unittest.TestCase):
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
                "SALES_TAX_RATE": "0.08875",
            }
        )
        cls.client = cls.app.test_client()

        with cls.app.app_context():
            db.create_all()

            role = Role(name="Admin", access_level=5)
            db.session.add(role)
            db.session.flush()
            cls.role_id = role.id

            user = User(
                username="owner01",
                first_name="Alice",
                last_name="Smith",
                email="alice@example.com",
                phone_number="1234567890",
                role_id=cls.role_id,
            )
            user.password_hash = "secure-password"
            db.session.add(user)
            db.session.flush()
            cls.user_id = user.id

            table = Table(number=1, capacity=4)
            db.session.add(table)
            db.session.flush()
            cls.table_id = table.id

            category = MenuCategory(name="Test Entrees")
            db.session.add(category)
            db.session.flush()
            cls.category_id = category.id

            menu_item = MenuItem(
                name="Test Bibimbap", price=40, category_id=category.id
            )
            db.session.add(menu_item)
            db.session.flush()
            cls.menu_item_id = menu_item.id

            db.session.commit()

        login_response = cls.client.post(
            "/api/auth/login",
            json={"username": "owner01", "password": "secure-password"},
        )
        if login_response.status_code != 200:
            raise RuntimeError("Could not authenticate domain route test client")
        csrf_cookie = cls.client.get_cookie("csrf_access_token")
        cls.client.environ_base["HTTP_X_CSRF_TOKEN"] = csrf_cookie.value

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            db.session.remove()
            db.drop_all()
        os.remove(cls.db_path)

    def create_order_with_item(self, *, order_type="take_out", quantity=1):
        order_response = self.client.post(
            "/api/orders",
            json={
                "type": order_type,
                "guests": 2,
                "table_id": self.table_id if order_type == "dine_in" else None,
                "items": [
                    {
                        "menu_item_id": self.menu_item_id,
                        "quantity": quantity,
                    }
                ],
            },
        )
        self.assertEqual(order_response.status_code, 201)
        order = order_response.get_json()
        self.assertEqual(order["status"], "open")
        self.assertEqual(order["total_price"], round(40 * quantity * 1.08875, 2))
        self.assertEqual(order["sales_tax"], 0.08875)
        self.assertEqual(order["user_id"], self.user_id)
        self.assertEqual(order["order_items"][0]["price"], 40.0)
        return order["id"], order["order_items"][0]["id"]

    def test_role_crud_flow(self):
        create_response = self.client.post(
            "/api/roles",
            json={"name": "Server", "access_level": 2},
        )
        self.assertEqual(create_response.status_code, 201)
        role_id = create_response.get_json()["id"]

        fetch_response = self.client.get(f"/api/roles/{role_id}")
        self.assertEqual(fetch_response.status_code, 200)

        patch_response = self.client.patch(
            f"/api/roles/{role_id}",
            json={"name": "Lead Server"},
        )
        self.assertEqual(patch_response.status_code, 200)
        self.assertEqual(patch_response.get_json()["name"], "Lead Server")

        delete_response = self.client.delete(f"/api/roles/{role_id}")
        self.assertEqual(delete_response.status_code, 204)

        missing_response = self.client.get(f"/api/roles/{role_id}")
        self.assertEqual(missing_response.status_code, 404)

    def test_role_validation_errors_return_400(self):
        invalid_access_level = self.client.post(
            "/api/roles",
            json={"name": "Server", "access_level": 99},
        )
        self.assertEqual(invalid_access_level.status_code, 400)
        self.assertEqual(
            invalid_access_level.get_json()["message"], "Invalid access level"
        )

        missing_required_name = self.client.post(
            "/api/roles",
            json={"access_level": 2},
        )
        self.assertEqual(missing_required_name.status_code, 400)

    def test_role_users_not_found_returns_404(self):
        response = self.client.get("/api/roles/99999/users")
        self.assertEqual(response.status_code, 404)

    def test_menu_category_crud_flow(self):
        create_response = self.client.post(
            "/api/menu_categories",
            json={"name": "Entrees", "secondary_name": "Main"},
        )
        self.assertEqual(create_response.status_code, 201)
        category_id = create_response.get_json()["id"]

        fetch_response = self.client.get(f"/api/menu_categories/{category_id}")
        self.assertEqual(fetch_response.status_code, 200)

        patch_response = self.client.patch(
            f"/api/menu_categories/{category_id}",
            json={"secondary_name": "Mains"},
        )
        self.assertEqual(patch_response.status_code, 200)
        self.assertEqual(patch_response.get_json()["secondary_name"], "Mains")

        delete_response = self.client.delete(f"/api/menu_categories/{category_id}")
        self.assertEqual(delete_response.status_code, 204)

        missing_response = self.client.get(f"/api/menu_categories/{category_id}")
        self.assertEqual(missing_response.status_code, 404)

    def test_menu_category_validation_errors_return_400(self):
        short_name = self.client.post(
            "/api/menu_categories",
            json={"name": "ab", "secondary_name": "Main"},
        )
        self.assertEqual(short_name.status_code, 400)
        self.assertEqual(
            short_name.get_json()["message"],
            "Category name must be at least 3 characters long",
        )

        duplicate_name_first = self.client.post(
            "/api/menu_categories",
            json={"name": "Drinks", "secondary_name": "Beverages"},
        )
        self.assertEqual(duplicate_name_first.status_code, 201)

        duplicate_name_second = self.client.post(
            "/api/menu_categories",
            json={"name": "Drinks", "secondary_name": "Cold"},
        )
        self.assertEqual(duplicate_name_second.status_code, 400)
        self.assertEqual(
            duplicate_name_second.get_json()["message"], "Database integrity error"
        )

    def test_menu_category_items_endpoint_returns_category_items(self):
        category_response = self.client.post(
            "/api/menu_categories",
            json={"name": "Desserts", "secondary_name": "Sweets"},
        )
        self.assertEqual(category_response.status_code, 201)
        category_id = category_response.get_json()["id"]

        item_response = self.client.post(
            "/api/menu_items",
            json={
                "name": "Hotteok",
                "price": 8.5,
                "category_id": category_id,
            },
        )
        self.assertEqual(item_response.status_code, 201)
        item_id = item_response.get_json()["id"]

        response = self.client.get(f"/api/menu_categories/{category_id}/menu_items")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual([item["id"] for item in payload], [item_id])
        self.assertIsInstance(payload[0]["price"], float)

        missing_response = self.client.get("/api/menu_categories/99999/menu_items")
        self.assertEqual(missing_response.status_code, 404)

        self.client.delete(f"/api/menu_items/{item_id}")
        self.client.delete(f"/api/menu_categories/{category_id}")

    def test_order_totals_use_persisted_menu_prices_and_payments_are_immutable(self):
        order_id, order_item_id = self.create_order_with_item()

        fetch_order_response = self.client.get(f"/api/orders/{order_id}")
        self.assertEqual(fetch_order_response.status_code, 200)
        self.assertEqual(fetch_order_response.get_json()["total_price"], 43.55)
        self.assertIsInstance(fetch_order_response.get_json()["sales_tax"], float)

        item_update_response = self.client.patch(
            f"/api/order_items/{order_item_id}",
            json={"quantity": 2, "price": 0.01},
        )
        self.assertEqual(item_update_response.status_code, 200)
        self.assertEqual(item_update_response.get_json()["price"], 40.0)

        updated_order = self.client.get(f"/api/orders/{order_id}").get_json()
        self.assertEqual(updated_order["total_price"], 87.1)

        managed_total_response = self.client.patch(
            f"/api/orders/{order_id}", json={"total_price": 1, "status": "closed"}
        )
        self.assertEqual(managed_total_response.status_code, 400)
        self.assertEqual(
            managed_total_response.get_json()["message"],
            "Unexpected fields: status, total_price",
        )

        create_payment_response = self.client.post(
            "/api/payments",
            json={"amount": 20.0, "type": "cash", "order_id": order_id},
        )
        self.assertEqual(create_payment_response.status_code, 201)
        payment_payload = create_payment_response.get_json()
        payment_id = payment_payload["id"]
        self.assertIsInstance(payment_payload["amount"], float)

        fetch_payment_response = self.client.get(f"/api/payments/{payment_id}")
        self.assertEqual(fetch_payment_response.status_code, 200)
        self.assertEqual(
            self.client.patch(
                f"/api/payments/{payment_id}", json={"amount": 1}
            ).status_code,
            405,
        )
        self.assertEqual(
            self.client.delete(f"/api/payments/{payment_id}").status_code, 405
        )
        self.assertEqual(
            self.client.get(f"/api/payments/{payment_id}").get_json()["amount"], 20.0
        )

    def test_payments_keep_partial_orders_open_and_close_exactly_paid_orders(self):
        order_id, order_item_id = self.create_order_with_item(order_type="dine_in")
        order_total = self.client.get(f"/api/orders/{order_id}").get_json()[
            "total_price"
        ]

        partial_response = self.client.post(
            "/api/payments",
            json={"amount": 12.5, "type": "cash", "order_id": order_id},
        )
        self.assertEqual(partial_response.status_code, 201)

        partial_order = self.client.get(f"/api/orders/{order_id}").get_json()
        self.assertEqual(partial_order["status"], "open")
        self.assertIsNone(partial_order["closed_at"])

        remaining = round(order_total - 12.5, 2)

        overpayment_response = self.client.post(
            "/api/payments",
            json={"amount": remaining + 0.01, "type": "visa", "order_id": order_id},
        )
        self.assertEqual(overpayment_response.status_code, 400)
        self.assertEqual(
            overpayment_response.get_json()["message"],
            f"Payment exceeds remaining balance of ${remaining:.2f}",
        )

        exact_response = self.client.post(
            "/api/payments",
            json={"amount": remaining, "type": "visa", "order_id": order_id},
        )
        self.assertEqual(exact_response.status_code, 201)

        closed_order = self.client.get(f"/api/orders/{order_id}").get_json()
        self.assertEqual(closed_order["status"], "closed")
        self.assertIsNotNone(closed_order["closed_at"])
        self.assertEqual(
            sorted(payment["amount"] for payment in closed_order["payments"]),
            [12.5, remaining],
        )
        self.assertTrue(
            all(
                isinstance(payment["amount"], float)
                for payment in closed_order["payments"]
            )
        )

        open_table_orders = self.client.get(
            f"/api/tables/{self.table_id}/orders"
        ).get_json()
        self.assertNotIn(order_id, [order["id"] for order in open_table_orders])

        closed_order_payment = self.client.post(
            "/api/payments",
            json={"amount": 1, "type": "cash", "order_id": order_id},
        )
        self.assertEqual(closed_order_payment.status_code, 400)
        self.assertEqual(
            closed_order_payment.get_json()["message"], "Order is already closed"
        )

        closed_item_update = self.client.patch(
            f"/api/order_items/{order_item_id}", json={"quantity": 2}
        )
        self.assertEqual(closed_item_update.status_code, 400)
        self.assertEqual(
            closed_item_update.get_json()["message"],
            "Closed orders cannot be modified",
        )

    def test_order_and_payment_validation_errors_return_400(self):
        invalid_order = self.client.post(
            "/api/orders",
            json={
                "type": "delivery",
                "guests": 2,
                "table_id": self.table_id,
            },
        )
        self.assertEqual(invalid_order.status_code, 400)
        self.assertEqual(invalid_order.get_json()["message"], "Invalid order type")

        order_id, _ = self.create_order_with_item(order_type="take_out")

        invalid_payment = self.client.post(
            "/api/payments",
            json={"amount": -5.0, "type": "cash", "order_id": order_id},
        )
        self.assertEqual(invalid_payment.status_code, 400)
        self.assertEqual(
            invalid_payment.get_json()["message"], "Invalid payment amount"
        )

    def test_order_items_not_found_returns_404(self):
        response = self.client.get("/api/orders/99999/items")
        self.assertEqual(response.status_code, 404)

    def test_user_creation_requires_password(self):
        response = self.client.post(
            "/api/users",
            json={
                "username": "server02",
                "first_name": "Bob",
                "last_name": "Taylor",
                "email": "bob@example.com",
                "phone_number": "1234567890",
                "role_id": self.role_id,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["message"], "Missing required field: password"
        )

        short_password = self.client.post(
            "/api/users",
            json={
                "username": "server03",
                "first_name": "Sammy",
                "last_name": "Taylor",
                "email": "sam@example.com",
                "role_id": self.role_id,
                "password": "short",
            },
        )
        self.assertEqual(short_password.status_code, 400)
        self.assertEqual(
            short_password.get_json()["message"],
            "Password must be at least 8 characters long",
        )

    def test_created_user_can_log_in_and_update_password(self):
        create_response = self.client.post(
            "/api/users",
            json={
                "username": "server02",
                "first_name": "Bobby",
                "last_name": "Taylor",
                "email": "bob@example.com",
                "phone_number": "1234567890",
                "role_id": self.role_id,
                "password": "first-password",
            },
        )
        self.assertEqual(create_response.status_code, 201)
        user_payload = create_response.get_json()
        user_id = user_payload["id"]
        self.assertNotIn("password", user_payload)
        self.assertNotIn("password_hash", user_payload)
        self.assertNotIn("_password_hash", user_payload)

        credential_client = self.app.test_client()
        login_response = credential_client.post(
            "/api/auth/login",
            json={"username": "server02", "password": "first-password"},
        )
        self.assertEqual(login_response.status_code, 200)

        update_response = self.client.patch(
            f"/api/users/{user_id}",
            json={"first_name": "Robert", "password": "second-password"},
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.get_json()["first_name"], "Robert")

        old_password_response = credential_client.post(
            "/api/auth/login",
            json={"username": "server02", "password": "first-password"},
        )
        self.assertEqual(old_password_response.status_code, 401)
        new_password_response = credential_client.post(
            "/api/auth/login",
            json={"username": "server02", "password": "second-password"},
        )
        self.assertEqual(new_password_response.status_code, 200)

        empty_password_update = self.client.patch(
            f"/api/users/{user_id}",
            json={"last_name": "Updated", "password": ""},
        )
        self.assertEqual(empty_password_update.status_code, 400)
        self.assertEqual(
            empty_password_update.get_json()["message"], "Password is required"
        )
        retained_password_response = credential_client.post(
            "/api/auth/login",
            json={"username": "server02", "password": "second-password"},
        )
        self.assertEqual(retained_password_response.status_code, 200)

        self.client.delete(f"/api/users/{user_id}")


if __name__ == "__main__":
    unittest.main()
