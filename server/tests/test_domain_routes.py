import os
import tempfile
import unittest

from app import create_app
from app.extensions import db
from app.models import Role, Table, User


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

            db.session.commit()

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            db.session.remove()
            db.drop_all()
        os.remove(cls.db_path)

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

    def test_order_and_payment_crud_flow(self):
        create_order_response = self.client.post(
            "/api/orders",
            json={
                "status": "open",
                "type": "dine_in",
                "guests": 2,
                "total_price": 42.5,
                "sales_tax": 0.08875,
                "user_id": self.user_id,
                "table_id": self.table_id,
            },
        )
        self.assertEqual(create_order_response.status_code, 201)
        order_id = create_order_response.get_json()["id"]

        fetch_order_response = self.client.get(f"/api/orders/{order_id}")
        self.assertEqual(fetch_order_response.status_code, 200)
        self.assertIsInstance(fetch_order_response.get_json()["total_price"], float)
        self.assertIsInstance(fetch_order_response.get_json()["sales_tax"], float)

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

        patch_payment_response = self.client.patch(
            f"/api/payments/{payment_id}",
            json={"amount": 40.0},
        )
        self.assertEqual(patch_payment_response.status_code, 200)

        delete_payment_response = self.client.delete(f"/api/payments/{payment_id}")
        self.assertEqual(delete_payment_response.status_code, 204)
        missing_payment_response = self.client.get(f"/api/payments/{payment_id}")
        self.assertEqual(missing_payment_response.status_code, 404)

        delete_order_response = self.client.delete(f"/api/orders/{order_id}")
        self.assertEqual(delete_order_response.status_code, 204)
        missing_order_response = self.client.get(f"/api/orders/{order_id}")
        self.assertEqual(missing_order_response.status_code, 404)

    def test_payments_keep_partial_orders_open_and_close_exactly_paid_orders(self):
        create_order_response = self.client.post(
            "/api/orders",
            json={
                "status": "open",
                "type": "dine_in",
                "guests": 2,
                "total_price": 42.5,
                "sales_tax": 0.08875,
                "user_id": self.user_id,
                "table_id": self.table_id,
            },
        )
        self.assertEqual(create_order_response.status_code, 201)
        order_id = create_order_response.get_json()["id"]

        partial_response = self.client.post(
            "/api/payments",
            json={"amount": 12.5, "type": "cash", "order_id": order_id},
        )
        self.assertEqual(partial_response.status_code, 201)
        partial_payment_id = partial_response.get_json()["id"]

        partial_order = self.client.get(f"/api/orders/{order_id}").get_json()
        self.assertEqual(partial_order["status"], "open")
        self.assertIsNone(partial_order["closed_at"])

        overpayment_response = self.client.post(
            "/api/payments",
            json={"amount": 30.01, "type": "visa", "order_id": order_id},
        )
        self.assertEqual(overpayment_response.status_code, 400)
        self.assertEqual(
            overpayment_response.get_json()["message"],
            "Payment exceeds remaining balance of $30.00",
        )

        exact_response = self.client.post(
            "/api/payments",
            json={"amount": 30, "type": "visa", "order_id": order_id},
        )
        self.assertEqual(exact_response.status_code, 201)
        exact_payment_id = exact_response.get_json()["id"]

        closed_order = self.client.get(f"/api/orders/{order_id}").get_json()
        self.assertEqual(closed_order["status"], "closed")
        self.assertIsNotNone(closed_order["closed_at"])
        self.assertEqual(
            sorted(payment["amount"] for payment in closed_order["payments"]),
            [12.5, 30.0],
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

        self.client.delete(f"/api/payments/{partial_payment_id}")
        self.client.delete(f"/api/payments/{exact_payment_id}")
        self.client.delete(f"/api/orders/{order_id}")

    def test_order_and_payment_validation_errors_return_400(self):
        invalid_order = self.client.post(
            "/api/orders",
            json={
                "status": "pending",
                "type": "dine_in",
                "guests": 2,
                "total_price": 20.0,
                "sales_tax": 0.08875,
                "user_id": self.user_id,
                "table_id": self.table_id,
            },
        )
        self.assertEqual(invalid_order.status_code, 400)
        self.assertEqual(invalid_order.get_json()["message"], "Invalid order status")

        create_order = self.client.post(
            "/api/orders",
            json={
                "status": "open",
                "type": "take_out",
                "guests": 1,
                "total_price": 18.0,
                "sales_tax": 0.08875,
                "user_id": self.user_id,
                "table_id": None,
            },
        )
        self.assertEqual(create_order.status_code, 201)
        order_id = create_order.get_json()["id"]

        invalid_payment = self.client.post(
            "/api/payments",
            json={"amount": -5.0, "type": "cash", "order_id": order_id},
        )
        self.assertEqual(invalid_payment.status_code, 400)
        self.assertEqual(
            invalid_payment.get_json()["message"], "Invalid payment amount"
        )

        delete_order_response = self.client.delete(f"/api/orders/{order_id}")
        self.assertEqual(delete_order_response.status_code, 204)

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

        login_response = self.client.post(
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

        old_password_response = self.client.post(
            "/api/auth/login",
            json={"username": "server02", "password": "first-password"},
        )
        self.assertEqual(old_password_response.status_code, 401)
        new_password_response = self.client.post(
            "/api/auth/login",
            json={"username": "server02", "password": "second-password"},
        )
        self.assertEqual(new_password_response.status_code, 200)

        empty_password_update = self.client.patch(
            f"/api/users/{user_id}",
            json={"last_name": "Updated", "password": ""},
        )
        self.assertEqual(empty_password_update.status_code, 200)
        retained_password_response = self.client.post(
            "/api/auth/login",
            json={"username": "server02", "password": "second-password"},
        )
        self.assertEqual(retained_password_response.status_code, 200)

        self.client.delete(f"/api/users/{user_id}")


if __name__ == "__main__":
    unittest.main()
