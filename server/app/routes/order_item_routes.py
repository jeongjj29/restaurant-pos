from flask import Blueprint, abort, request, make_response
from app.authorization import MANAGER_ACCESS_LEVEL, access_level_required
from app.models import MenuItem, Order, OrderItem
from app.extensions import db
from app.order_totals import recompute_order_total
from .utils import get_json_object, get_or_404

order_item_bp = Blueprint("order_items", __name__, url_prefix="/api/order_items")
ORDER_ITEM_CREATE_FIELDS = {
    "order_id",
    "menu_item_id",
    "quantity",
    # Accepted for compatibility but deliberately ignored in favor of menu price.
    "price",
    "discount_id",
}


def _get_locked_order(order_id):
    order = db.session.execute(
        db.select(Order).where(Order.id == order_id).with_for_update()
    ).scalar_one_or_none()
    if order is None:
        abort(404)
    return order


def _ensure_open(order):
    if order.status != "open":
        raise ValueError("Closed orders cannot be modified")


@order_item_bp.route("/", methods=["GET"])
@access_level_required()
def get_order_items():
    order_items = [order_item.to_dict() for order_item in OrderItem.query.all()]
    return make_response(order_items, 200)


@order_item_bp.route("/", methods=["POST"])
@access_level_required()
def create_order_item():
    data = get_json_object(ORDER_ITEM_CREATE_FIELDS)
    order = _get_locked_order(data["order_id"])
    _ensure_open(order)
    menu_item = get_or_404(MenuItem, data["menu_item_id"])

    order_item = OrderItem(
        quantity=data["quantity"],
        price=menu_item.price,
        discount_id=data.get("discount_id"),
        order_id=order.id,
        menu_item_id=menu_item.id,
    )
    db.session.add(order_item)
    db.session.flush()
    recompute_order_total(order)
    db.session.commit()
    return make_response(order_item.to_dict(), 201)


@order_item_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
@access_level_required(method_levels={"DELETE": MANAGER_ACCESS_LEVEL})
def handle_order_item(id):
    order_item = get_or_404(OrderItem, id)

    if request.method == "GET":
        return make_response(order_item.to_dict(), 200)

    if request.method == "PATCH":
        order = _get_locked_order(order_item.order_id)
        _ensure_open(order)
        data = get_json_object()

        requested_order_id = data.pop("order_id", order.id)
        if requested_order_id != order.id:
            raise ValueError("Order items cannot be moved between orders")
        data.pop("id", None)
        data.pop("price", None)

        allowed_fields = {"quantity", "menu_item_id", "discount_id"}
        if set(data).difference(allowed_fields):
            raise ValueError("Invalid order item update field")

        if "menu_item_id" in data:
            menu_item = get_or_404(MenuItem, data["menu_item_id"])
            order_item.menu_item_id = menu_item.id
            order_item.price = menu_item.price
            data.pop("menu_item_id")

        for key, value in data.items():
            setattr(order_item, key, value)
        db.session.flush()
        recompute_order_total(order)
        db.session.commit()
        return make_response(order_item.to_dict(), 200)

    if request.method == "DELETE":
        order = _get_locked_order(order_item.order_id)
        _ensure_open(order)
        db.session.delete(order_item)
        db.session.flush()
        recompute_order_total(order)
        db.session.commit()
        return make_response({}, 204)
