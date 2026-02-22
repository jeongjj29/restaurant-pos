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


if __name__ == "__main__":
    unittest.main()
