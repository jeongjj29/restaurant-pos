from flask import Blueprint, request, make_response
from app.models import OrderItem
from app.extensions import db

order_item_bp = Blueprint("order_items", __name__, url_prefix="/api/order_items")

@order_item_bp.route("/", methods=["GET"])
def get_order_items():
    order_items = [order_item.to_dict() for order_item in OrderItem.query.all()]
    return make_response(order_items, 200)

@order_item_bp.route("/", methods=["POST"])
def create_order_item():
    data = request.get_json()
    order_item = OrderItem(**data)
    db.session.add(order_item)
    db.session.commit()
    return make_response(order_item.to_dict(), 201)

@order_item_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
def handle_order_item(id):
    order_item = OrderItem.query.get_or_404(id)

    if request.method == "GET":
        return make_response(order_item.to_dict(), 200)

    if request.method == "PATCH":
        for key, value in request.get_json().items():
            setattr(order_item, key, value)
        db.session.commit()
        return make_response(order_item.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(order_item)
        db.session.commit()
        return make_response({}, 204)
