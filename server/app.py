#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, make_response
from flask_restful import Resource

# Local imports
from config import app, db, api

# Add your model imports
from models import *

# Views go here!


@app.route("/")
def index():
    return "<h1>Project Server</h1>"


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


api.add_resource(Users, "/users")
api.add_resource(UsersById, "/users/<int:id>")

api.add_resource(Roles, "/roles")
api.add_resource(RolesById, "/roles/<int:id>")

api.add_resource(Orders, "/orders")
api.add_resource(OrdersById, "/orders/<int:id>")

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


if __name__ == "__main__":
    app.run(port=5555, debug=True)
