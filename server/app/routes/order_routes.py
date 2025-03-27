from flask import Blueprint, request, make_response
from app.models import Order
from app.extensions import db

order_bp = Blueprint("orders", __name__, url_prefix="/api/orders")

@order_bp.route("/", methods=["GET"])
def get_orders():
    orders = [order.to_dict() for order in Order.query.all()]
    return make_response(orders, 200)

@order_bp.route("/", methods=["POST"])
def create_order():
    data = request.get_json()
    order = Order(**data)
    db.session.add(order)
    db.session.commit()
    return make_response(order.to_dict(), 201)

@order_bp.route("/<int:id>", methods=["GET","PATCH","DELETE"])
def handle_order(id):
    order = Order.query.get_or_404(id)

    if request.method == "GET":
        return make_response(order.to_dict(), 200)

    if request.method == "PATCH":
        for key, value in request.get_json().items():
            setattr(order, key, value)
        db.session.commit()
        return make_response(order.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(order)
        db.session.commit()
        return make_response({}, 204)   
    
@order_bp.route("/<int:id>/items", methods=["GET"])
def get_order_items(id):
    order = Order.query.get_or_404(id)
    order_items = [order_item.to_dict() for order_item in order.order_items]
    return make_response(order_items, 200)