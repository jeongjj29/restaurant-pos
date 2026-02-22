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

        patch_order_response = self.client.patch(
            f"/api/orders/{order_id}",
            json={"status": "closed"},
        )
        self.assertEqual(patch_order_response.status_code, 200)
        self.assertEqual(patch_order_response.get_json()["status"], "closed")

        create_payment_response = self.client.post(
            "/api/payments",
            json={"amount": 42.5, "type": "cash", "order_id": order_id},
        )
        self.assertEqual(create_payment_response.status_code, 201)
        payment_id = create_payment_response.get_json()["id"]

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


if __name__ == "__main__":
    unittest.main()
