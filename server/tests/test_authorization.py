import os
import tempfile
import unittest
from decimal import Decimal

from flask_jwt_extended import create_access_token

from app import create_app
from app.extensions import db
from app.models import (
    Discount,
    MenuCategory,
    MenuItem,
    Order,
    OrderItem,
    Role,
    Table,
    User,
)


class AuthorizationTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fd, cls.db_path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        cls.app = create_app(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": f"sqlite:///{cls.db_path}",
                "JWT_SECRET_KEY": "authorization-test-secret",
                "JWT_TOKEN_LOCATION": ["cookies"],
                "JWT_COOKIE_CSRF_PROTECT": True,
                "JWT_COOKIE_SECURE": False,
                "MIN_PASSWORD_LENGTH": 8,
                "SALES_TAX_RATE": "0.08875",
            }
        )

        with cls.app.app_context():
            db.create_all()
            admin_role = Role(name="Admin", access_level=5)
            manager_role = Role(name="Manager", access_level=4)
            staff_role = Role(name="Server", access_level=2)
            db.session.add_all([admin_role, manager_role, staff_role])
            db.session.flush()
            cls.admin_role_id = admin_role.id
            cls.manager_role_id = manager_role.id
            cls.staff_role_id = staff_role.id

            users = []
            for username, role in (
                ("admin01", admin_role),
                ("manager01", manager_role),
                ("server01", staff_role),
            ):
                user = User(
                    username=username,
                    first_name=username[:5].title(),
                    last_name="Tester",
                    email=f"{username}@example.com",
                    role=role,
                )
                user.password_hash = "secure-password"
                users.append(user)
            db.session.add_all(users)
            db.session.flush()
            cls.admin_user_id = users[0].id
            cls.manager_user_id = users[1].id
            cls.staff_user_id = users[2].id

            category = MenuCategory(name="Entrees")
            table = Table(number=1, capacity=4)
            discount = Discount(name="Lunch", amount=2)
            db.session.add_all([category, table, discount])
            db.session.flush()
            cls.category_id = category.id
            cls.table_id = table.id
            cls.discount_id = discount.id

            menu_item = MenuItem(name="Bibimbap", price=10, menu_category=category)
            db.session.add(menu_item)
            db.session.flush()
            cls.menu_item_id = menu_item.id

            order = Order(
                status="open",
                type="dine_in",
                guests=2,
                total_price=Decimal("10.89"),
                sales_tax=Decimal("0.08875"),
                user_id=cls.staff_user_id,
                table_id=table.id,
            )
            db.session.add(order)
            db.session.flush()
            cls.order_id = order.id

            order_item = OrderItem(
                quantity=1,
                price=menu_item.price,
                order_id=order.id,
                menu_item_id=menu_item.id,
            )
            db.session.add(order_item)
            db.session.flush()
            cls.order_item_id = order_item.id
            db.session.commit()

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            db.session.remove()
            db.drop_all()
        os.remove(cls.db_path)

    def authenticated_client(self, username):
        client = self.app.test_client()
        login_response = client.post(
            "/api/auth/login",
            json={"username": username, "password": "secure-password"},
        )
        self.assertEqual(login_response.status_code, 200)
        csrf_cookie = client.get_cookie("csrf_access_token")
        client.environ_base["HTTP_X_CSRF_TOKEN"] = csrf_cookie.value
        return client

    def test_every_domain_api_requires_authentication(self):
        endpoints = (
            ("GET", "/api/config"),
            ("GET", "/api/discounts"),
            ("POST", "/api/discounts"),
            ("GET", f"/api/discounts/{self.discount_id}"),
            ("PATCH", f"/api/discounts/{self.discount_id}"),
            ("DELETE", f"/api/discounts/{self.discount_id}"),
            ("GET", "/api/menu_categories"),
            ("POST", "/api/menu_categories"),
            ("GET", f"/api/menu_categories/{self.category_id}"),
            ("PATCH", f"/api/menu_categories/{self.category_id}"),
            ("DELETE", f"/api/menu_categories/{self.category_id}"),
            ("GET", f"/api/menu_categories/{self.category_id}/menu_items"),
            ("GET", "/api/menu_items"),
            ("POST", "/api/menu_items"),
            ("GET", f"/api/menu_items/{self.menu_item_id}"),
            ("PATCH", f"/api/menu_items/{self.menu_item_id}"),
            ("DELETE", f"/api/menu_items/{self.menu_item_id}"),
            ("GET", "/api/order_items"),
            ("POST", "/api/order_items"),
            ("GET", f"/api/order_items/{self.order_item_id}"),
            ("PATCH", f"/api/order_items/{self.order_item_id}"),
            ("DELETE", f"/api/order_items/{self.order_item_id}"),
            ("GET", "/api/orders"),
            ("POST", "/api/orders"),
            ("GET", f"/api/orders/{self.order_id}"),
            ("PATCH", f"/api/orders/{self.order_id}"),
            ("DELETE", f"/api/orders/{self.order_id}"),
            ("GET", f"/api/orders/{self.order_id}/items"),
            ("GET", "/api/payments"),
            ("POST", "/api/payments"),
            ("GET", "/api/payments/1"),
            ("GET", "/api/roles"),
            ("POST", "/api/roles"),
            ("GET", f"/api/roles/{self.staff_role_id}"),
            ("PATCH", f"/api/roles/{self.staff_role_id}"),
            ("DELETE", f"/api/roles/{self.staff_role_id}"),
            ("GET", f"/api/roles/{self.staff_role_id}/users"),
            ("GET", "/api/tables"),
            ("POST", "/api/tables"),
            ("GET", f"/api/tables/{self.table_id}"),
            ("PATCH", f"/api/tables/{self.table_id}"),
            ("DELETE", f"/api/tables/{self.table_id}"),
            ("GET", f"/api/tables/{self.table_id}/orders"),
            ("GET", "/api/users"),
            ("POST", "/api/users"),
            ("GET", f"/api/users/{self.staff_user_id}"),
            ("PATCH", f"/api/users/{self.staff_user_id}"),
            ("DELETE", f"/api/users/{self.staff_user_id}"),
            ("GET", f"/api/users/{self.staff_user_id}/orders"),
        )

        client = self.app.test_client()
        for method, path in endpoints:
            with self.subTest(method=method, path=path):
                kwargs = {"json": {}} if method in {"POST", "PATCH"} else {}
                response = client.open(path, method=method, **kwargs)
                self.assertEqual(response.status_code, 401)

    def test_invalid_or_deleted_session_identity_is_rejected(self):
        for identity, expected_message in (
            ("not-a-user-id", "Invalid session identity"),
            ("999999", "User account no longer exists"),
        ):
            with self.subTest(identity=identity):
                with self.app.app_context():
                    token = create_access_token(identity=identity)
                client = self.app.test_client()
                client.set_cookie("access_token_cookie", token)

                response = client.get("/api/orders")
                self.assertEqual(response.status_code, 401)
                self.assertEqual(response.get_json()["message"], expected_message)

    def test_staff_cannot_perform_manager_or_admin_mutations(self):
        staff_client = self.authenticated_client("server01")
        manager_mutations = (
            ("POST", "/api/discounts"),
            ("PATCH", f"/api/discounts/{self.discount_id}"),
            ("DELETE", f"/api/discounts/{self.discount_id}"),
            ("POST", "/api/menu_categories"),
            ("PATCH", f"/api/menu_categories/{self.category_id}"),
            ("DELETE", f"/api/menu_categories/{self.category_id}"),
            ("POST", "/api/menu_items"),
            ("PATCH", f"/api/menu_items/{self.menu_item_id}"),
            ("DELETE", f"/api/menu_items/{self.menu_item_id}"),
            ("POST", "/api/tables"),
            ("PATCH", f"/api/tables/{self.table_id}"),
            ("DELETE", f"/api/tables/{self.table_id}"),
            ("DELETE", f"/api/orders/{self.order_id}"),
            ("DELETE", f"/api/order_items/{self.order_item_id}"),
        )
        for method, path in manager_mutations:
            with self.subTest(method=method, path=path):
                kwargs = {"json": {}} if method in {"POST", "PATCH"} else {}
                response = staff_client.open(path, method=method, **kwargs)
                self.assertEqual(response.status_code, 403)
                self.assertEqual(
                    response.get_json()["message"], "Insufficient permissions"
                )

        manager_reads = (
            "/api/roles",
            f"/api/roles/{self.staff_role_id}",
            f"/api/roles/{self.staff_role_id}/users",
            "/api/users",
            f"/api/users/{self.staff_user_id}",
            f"/api/users/{self.staff_user_id}/orders",
        )
        for path in manager_reads:
            with self.subTest(method="GET", path=path):
                response = staff_client.get(path)
                self.assertEqual(response.status_code, 403)
                self.assertEqual(
                    response.get_json()["message"], "Insufficient permissions"
                )

        manager_client = self.authenticated_client("manager01")
        admin_mutations = (
            ("POST", "/api/roles"),
            ("PATCH", f"/api/roles/{self.staff_role_id}"),
            ("DELETE", f"/api/roles/{self.staff_role_id}"),
            ("POST", "/api/users"),
            ("PATCH", f"/api/users/{self.staff_user_id}"),
            ("DELETE", f"/api/users/{self.staff_user_id}"),
        )
        for method, path in admin_mutations:
            with self.subTest(method=method, path=path):
                kwargs = {"json": {}} if method in {"POST", "PATCH"} else {}
                response = manager_client.open(path, method=method, **kwargs)
                self.assertEqual(response.status_code, 403)
                self.assertEqual(
                    response.get_json()["message"], "Insufficient permissions"
                )

    def test_staff_can_read_domains_and_run_operational_order_flow(self):
        client = self.authenticated_client("server01")
        for path in (
            "/api/config",
            "/api/discounts",
            "/api/menu_categories",
            "/api/menu_items",
            "/api/order_items",
            "/api/orders",
            "/api/payments",
            "/api/tables",
        ):
            with self.subTest(path=path):
                self.assertEqual(client.get(path).status_code, 200)

        order_response = client.post(
            "/api/orders",
            json={
                "type": "take_out",
                "items": [{"menu_item_id": self.menu_item_id, "quantity": 1}],
            },
        )
        self.assertEqual(order_response.status_code, 201)
        order = order_response.get_json()
        self.assertEqual(order["user_id"], self.staff_user_id)

        order_item = order["order_items"][0]
        self.assertEqual(order_item["price"], 10.0)

        item_update = client.patch(
            f"/api/order_items/{order_item['id']}",
            json={"quantity": 2, "price": 999},
        )
        self.assertEqual(item_update.status_code, 200)
        self.assertEqual(item_update.get_json()["price"], 10.0)

        updated_order = client.get(f"/api/orders/{order['id']}").get_json()
        self.assertEqual(updated_order["total_price"], 21.78)
        payment_response = client.post(
            "/api/payments",
            json={
                "amount": updated_order["total_price"],
                "type": "cash",
                "order_id": order["id"],
            },
        )
        self.assertEqual(payment_response.status_code, 201)
        self.assertEqual(
            client.get(f"/api/orders/{order['id']}").get_json()["status"],
            "closed",
        )

    def test_manager_and_admin_can_perform_their_authorized_mutations(self):
        manager_client = self.authenticated_client("manager01")
        self.assertEqual(manager_client.get("/api/roles").status_code, 200)
        self.assertEqual(manager_client.get("/api/users").status_code, 200)
        create_table = manager_client.post(
            "/api/tables", json={"number": 88, "capacity": 6}
        )
        self.assertEqual(create_table.status_code, 201)
        table_id = create_table.get_json()["id"]
        self.assertEqual(
            manager_client.patch(
                f"/api/tables/{table_id}", json={"capacity": 8}
            ).status_code,
            200,
        )
        self.assertEqual(
            manager_client.delete(f"/api/tables/{table_id}").status_code, 204
        )

        admin_client = self.authenticated_client("admin01")
        create_role = admin_client.post(
            "/api/roles", json={"name": "Auditor", "access_level": 1}
        )
        self.assertEqual(create_role.status_code, 201)
        role_id = create_role.get_json()["id"]

        create_user = admin_client.post(
            "/api/users",
            json={
                "username": "auditor01",
                "first_name": "Audit",
                "last_name": "Tester",
                "email": "auditor@example.com",
                "role_id": role_id,
                "password": "long-password",
            },
        )
        self.assertEqual(create_user.status_code, 201)
        user_id = create_user.get_json()["id"]
        self.assertEqual(
            admin_client.patch(
                f"/api/users/{user_id}", json={"last_name": "Updated"}
            ).status_code,
            200,
        )
        self.assertEqual(admin_client.delete(f"/api/users/{user_id}").status_code, 204)
        self.assertEqual(admin_client.delete(f"/api/roles/{role_id}").status_code, 204)


if __name__ == "__main__":
    unittest.main()
