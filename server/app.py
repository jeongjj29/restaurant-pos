#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, make_response, session, abort
from flask_restful import Resource
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)


# Local imports
from config import app, db, api

# Add your model imports
from models import *

app.config["JWT_SECRET_KEY"] = "[DGa9VbV9hhfdsaf@/A1*~CF?>2y{aJDw%"
app.config["JWT_BLACKLIST_ENABLED"] = True
app.config["JWT_BLACKLIST_TOKEN_CHECKS"] = ["access", "refresh"]
jwt = JWTManager(app)


@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token = TokenBlockList.query.filter_by(jti=jti).first()
    return token is not None


@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return make_response({"description": "The token has been revoked"}, 401)


@app.route("/")
def index():
    return "<h1>Restaurant Server</h1>"


# Login
class Login(Resource):
    def post(self):
        data = request.get_json()

        username = data.get("username")
        password = data.get("password")

        user = User.query.filter_by(username=username).first()

        if user and user.authenticate(password):
            access_token = create_access_token(identity=user)
            return make_response({"access_token": access_token}, 200)

        else:
            return make_response({"message": "Invalid credentials"}, 401)


class Logout(Resource):
    @jwt_required()
    def post(self):
        jti = get_jwt_identity()
        token = TokenBlockList(jti=jti)
        db.session.add(token)
        db.session.commit()
        return make_response({"message": "Successfully logged out"}, 200)


class ProtectedRoute(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        return make_response({"message": f"Hello, {current_user['username']}"}), 200


# User Routes
class Users(Resource):
    def get(self):
        users = [user.to_dict() for user in User.query.all()]
        return make_response(users, 200)

    def post(self):
        data = request.get_json()
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return make_response(user.to_dict(), 201)


class UsersById(Resource):
    def get(self, id):
        user = User.query.get_or_404(id)
        return make_response(user.to_dict(), 200)

    def patch(self, id):
        data = request.get_json()
        user = User.query.get_or_404(id)
        for key, value in data.items():
            setattr(user, key, value)
        db.session.commit()
        return make_response(user.to_dict(), 200)

    def delete(self, id):
        user = User.query.get_or_404(id)
        db.session.delete(user)
        db.session.commit()
        return make_response({}, 204)


class UsersByRoleId(Resource):
    def get(self, id):
        users = [user.to_dict() for user in User.query.filter_by(role_id=id).all()]
        return make_response(users, 200)


# Role Routes
class Roles(Resource):
    def get(self):
        roles = [role.to_dict() for role in Role.query.all()]
        return make_response(roles, 200)

    def post(self):
        data = request.get_json()
        role = Role(
            name=data["name"],
            access_level=data["access_level"],
        )
        db.session.add(role)
        db.session.commit()
        return make_response(role.to_dict(), 201)


class RolesById(Resource):
    def get(self, id):
        role = Role.query.get_or_404(id)
        return make_response(role.to_dict(), 200)

    def patch(self, id):
        data = request.get_json()
        role = Role.query.get_or_404(id)
        for key, value in data.items():
            setattr(role, key, value)
        db.session.commit()
        return make_response(role.to_dict(), 200)

    def delete(self, id):
        role = Role.query.get_or_404(id)
        db.session.delete(role)
        db.session.commit()
        return make_response({}, 204)


# Order Routes
class Orders(Resource):
    def get(self):
        orders = [order.to_dict() for order in Order.query.all()]
        return make_response(orders, 200)

    def post(self):
        data = request.get_json()
        order = Order(**data)
        db.session.add(order)
        db.session.commit()
        return make_response(order.to_dict(), 201)


class OrdersById(Resource):
    def get(self, id):
        order = Order.query.get_or_404(id)
        return make_response(order.to_dict(), 200)

    def patch(self, id):
        data = request.get_json()
        order = Order.query.get_or_404(id)
        for key, value in data.items():
            setattr(order, key, value)
        db.session.commit()
        return make_response(order.to_dict(), 200)

    def delete(self, id):
        order = Order.query.get_or_404(id)

        db.session.delete(order)
        db.session.commit()
        return make_response({}, 204)


class OrdersByUserId(Resource):
    def get(self, id):
        orders = [order.to_dict() for order in Order.query.filter_by(user_id=id).all()]
        return make_response(orders, 200)


# Table Routes
class Tables(Resource):
    def get(self):
        tables = [table.to_dict() for table in Table.query.all()]
        return make_response(tables, 200)

    def post(self):
        data = request.get_json()
        table = Table(**data)
        db.session.add(table)
        db.session.commit()
        return make_response(table.to_dict(), 201)


class TablesById(Resource):
    def get(self, id):
        table = Table.query.get_or_404(id)
        return make_response(table.to_dict(), 200)

    def patch(self, id):
        data = request.get_json()
        table = Table.query.get_or_404(id)
        for key, value in data.items():
            setattr(table, key, value)
        db.session.commit()
        return make_response(table.to_dict(), 200)

    def delete(self, id):
        table = Table.query.get_or_404(id)
        db.session.delete(table)
        db.session.commit()
        return make_response({}, 204)


# Payment Routes
class Payments(Resource):
    def get(self):
        payments = [payment.to_dict() for payment in Payment.query.all()]
        return make_response(payments, 200)

    def post(self):
        data = request.get_json()
        payment = Payment(**data)
        db.session.add(payment)
        db.session.commit()
        return make_response(payment.to_dict(), 201)


class PaymentsById(Resource):
    def get(self, id):
        payment = Payment.query.get_or_404(id)
        return make_response(payment.to_dict(), 200)

    def patch(self, id):
        data = request.get_json()
        payment = Payment.query.get_or_404(id)
        for key, value in data.items():
            setattr(payment, key, value)
        db.session.commit()
        return make_response(payment.to_dict(), 200)

    def delete(self, id):
        payment = Payment.query.get_or_404(id)
        db.session.delete(payment)
        db.session.commit()
        return make_response({}, 204)


# OrderItem Routes
class OrderItems(Resource):
    def get(self):
        order_items = [order_item.to_dict() for order_item in OrderItem.query.all()]
        return make_response(order_items, 200)

    def post(self):
        data = request.get_json()
        order_item = OrderItem(**data)
        db.session.add(order_item)
        db.session.commit()
        return make_response(order_item.to_dict(), 201)


class OrderItemsById(Resource):
    def get(self, id):
        order_item = OrderItem.query.get_or_404(id)
        return make_response(order_item.to_dict(), 200)

    def patch(self, id):
        data = request.get_json()
        order_item = OrderItem.query.get_or_404(id)
        for key, value in data.items():
            setattr(order_item, key, value)
        db.session.commit()
        return make_response(order_item.to_dict(), 200)

    def delete(self, id):
        order_item = OrderItem.query.get_or_404(id)
        db.session.delete(order_item)
        db.session.commit()
        return make_response({}, 204)


class OrderItemsByOrderId(Resource):
    def get(self, id):
        order_items = [
            order_item.to_dict()
            for order_item in OrderItem.query.filter_by(order_id=id).all()
        ]
        return make_response(order_items, 200)


# Discount Routes
class Discounts(Resource):
    def get(self):
        discounts = [discount.to_dict() for discount in Discount.query.all()]
        return make_response(discounts, 200)

    def post(self):
        data = request.get_json()
        discount = Discount(**data)
        db.session.add(discount)
        db.session.commit()
        return make_response(discount.to_dict(), 201)


class DiscountsById(Resource):
    def get(self, id):
        discount = Discount.query.get_or_404(id)
        return make_response(discount.to_dict(), 200)

    def patch(self, id):
        data = request.get_json()
        discount = Discount.query.get_or_404(id)
        for key, value in data.items():
            setattr(discount, key, value)
        db.session.commit()
        return make_response(discount.to_dict(), 200)

    def delete(self, id):
        discount = Discount.query.get_or_404(id)
        db.session.delete(discount)
        db.session.commit()
        return make_response({}, 204)


# Menu Item Routes
class MenuItems(Resource):
    def get(self):
        menu_items = [menu_item.to_dict() for menu_item in MenuItem.query.all()]
        return make_response(menu_items, 200)

    def post(self):
        data = request.get_json()
        menu_item = MenuItem(**data)
        db.session.add(menu_item)
        db.session.commit()
        return make_response(menu_item.to_dict(), 201)


class MenuItemsById(Resource):
    def get(self, id):
        menu_item = MenuItem.query.get_or_404(id)
        return make_response(menu_item.to_dict(), 200)

    def patch(self, id):
        data = request.get_json()
        menu_item = MenuItem.query.get_or_404(id)
        for key, value in data.items():
            setattr(menu_item, key, value)
        db.session.commit()
        return make_response(menu_item.to_dict(), 200)

    def delete(self, id):
        menu_item = MenuItem.query.get_or_404(id)
        db.session.delete(menu_item)
        db.session.commit()
        return make_response({}, 204)


# Menu Category Routes
class MenuCategories(Resource):
    def get(self):
        menu_categories = [
            menu_category.to_dict() for menu_category in MenuCategory.query.all()
        ]
        return make_response(menu_categories, 200)

    def post(self):
        data = request.get_json()
        menu_category = MenuCategory(**data)
        db.session.add(menu_category)
        db.session.commit()
        return make_response(menu_category.to_dict(), 201)


class MenuCategoriesById(Resource):
    def get(self, id):
        menu_category = MenuCategory.query.get_or_404(id)
        return make_response(menu_category.to_dict(), 200)

    def patch(self, id):
        data = request.get_json()
        menu_category = MenuCategory.query.get_or_404(id)
        for key, value in data.items():
            setattr(menu_category, key, value)
        db.session.commit()
        return make_response(menu_category.to_dict(), 200)

    def delete(self, id):
        menu_category = MenuCategory.query.get_or_404(id)
        db.session.delete(menu_category)
        db.session.commit()
        return make_response({}, 204)


class MenuItemsByMenuCategoryId(Resource):
    def get(self, id):
        menu_items = [
            item.to_dict()
            for item in MenuItem.query.filter_by(menu_category_id=id).all()
        ]
        return make_response(menu_items, 200)


api.add_resource(Users, "/users")
api.add_resource(UsersById, "/users/<int:id>")
api.add_resource(OrdersByUserId, "/users/<int:id>/orders")

api.add_resource(Roles, "/roles")
api.add_resource(RolesById, "/roles/<int:id>")
api.add_resource(UsersByRoleId, "/roles/<int:id>/users")

api.add_resource(Orders, "/orders")
api.add_resource(OrdersById, "/orders/<int:id>")
api.add_resource(OrderItemsByOrderId, "/orders/<int:id>/order_items")

api.add_resource(Tables, "/tables")
api.add_resource(TablesById, "/tables/<int:id>")

api.add_resource(Payments, "/payments")
api.add_resource(PaymentsById, "/payments/<int:id>")

api.add_resource(OrderItems, "/order_items")
api.add_resource(OrderItemsById, "/order_items/<int:id>")

api.add_resource(Discounts, "/discounts")
api.add_resource(DiscountsById, "/discounts/<int:id>")

api.add_resource(MenuItems, "/menu_items")
api.add_resource(MenuItemsById, "/menu_items/<int:id>")

api.add_resource(MenuCategories, "/menu_categories")
api.add_resource(MenuCategoriesById, "/menu_categories/<int:id>")
api.add_resource(MenuItemsByMenuCategoryId, "/menu_categories/<int:id>/menu_items")

api.add_resource(Login, "/login")
api.add_resource(Logout, "/logout")
api.add_resource(ProtectedRoute, "/protected")


if __name__ == "__main__":
    app.run(port=5555, debug=True)
