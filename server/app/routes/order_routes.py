from decimal import Decimal

from flask import Blueprint, request, make_response

from app.authorization import (
    MANAGER_ACCESS_LEVEL,
    access_level_required,
    current_user,
)
from app.extensions import db
from app.models import MenuItem, Order, OrderItem, Table
from app.order_totals import configured_sales_tax_rate, recompute_order_total
from .utils import get_json_object, get_or_404


order_bp = Blueprint("orders", __name__, url_prefix="/api/orders")
ORDER_CREATE_FIELDS = {"type", "guests", "table_id", "items"}
ORDER_UPDATE_FIELDS = {"type", "guests", "table_id"}
ORDER_ITEM_INPUT_FIELDS = {"menu_item_id", "quantity"}


def _validate_order_type(order_type):
    if order_type not in {"dine_in", "take_out"}:
        raise ValueError("Invalid order type")
    return order_type


def _validate_guests(guests):
    if isinstance(guests, bool) or not isinstance(guests, int) or guests < 0:
        raise ValueError("Invalid number of guests")
    return guests


def _validated_item_snapshots(items):
    if not isinstance(items, list) or not items:
        raise ValueError("Order items must be a non-empty list")

    snapshots = []
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("Each order item must be a JSON object")

        unexpected_fields = sorted(set(item).difference(ORDER_ITEM_INPUT_FIELDS))
        if unexpected_fields:
            raise ValueError(
                f"Unexpected order item fields: {', '.join(unexpected_fields)}"
            )

        menu_item_id = item["menu_item_id"]
        quantity = item["quantity"]
        if (
            isinstance(menu_item_id, bool)
            or not isinstance(menu_item_id, int)
            or menu_item_id < 1
        ):
            raise ValueError("Invalid menu item id")
        if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
            raise ValueError("Invalid quantity")

        menu_item = db.session.get(MenuItem, menu_item_id)
        if menu_item is None:
            raise ValueError(f"Menu item {menu_item_id} does not exist")
        snapshots.append((menu_item, quantity))

    return snapshots


def _locked_order_table(order_type, table_id, *, current_order_id=None):
    if order_type == "take_out":
        if table_id is not None:
            raise ValueError("Take-out orders cannot have a table")
        return None

    if isinstance(table_id, bool) or not isinstance(table_id, int) or table_id < 1:
        raise ValueError("Dine-in orders require a table")

    table = db.session.execute(
        db.select(Table).where(Table.id == table_id).with_for_update()
    ).scalar_one_or_none()
    if table is None:
        raise ValueError("Table does not exist")

    occupied_query = db.select(Order.id).where(
        Order.table_id == table.id, Order.status == "open"
    )
    if current_order_id is not None:
        occupied_query = occupied_query.where(Order.id != current_order_id)
    occupied_order_id = db.session.execute(occupied_query.limit(1)).scalar()
    if occupied_order_id is not None:
        raise ValueError("Table already has an open order")
    return table


@order_bp.route("/", methods=["GET"])
@access_level_required()
def get_orders():
    orders = [order.to_dict() for order in Order.query.all()]
    return make_response(orders, 200)


@order_bp.route("/", methods=["POST"])
@access_level_required()
def create_order():
    data = get_json_object(ORDER_CREATE_FIELDS)
    order_type = _validate_order_type(data["type"])
    guests = _validate_guests(data.get("guests", 0))
    item_snapshots = _validated_item_snapshots(data["items"])
    table = _locked_order_table(order_type, data.get("table_id"))

    order = Order(
        type=order_type,
        guests=guests,
        table_id=table.id if table is not None else None,
        status="open",
        total_price=Decimal("0.00"),
        sales_tax=configured_sales_tax_rate(),
        user_id=current_user().id,
    )
    order.order_items = [
        OrderItem(
            quantity=quantity,
            price=menu_item.price,
            menu_item_id=menu_item.id,
        )
        for menu_item, quantity in item_snapshots
    ]

    try:
        db.session.add(order)
        db.session.flush()
        recompute_order_total(order)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return make_response(order.to_dict(), 201)


@order_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
@access_level_required(method_levels={"DELETE": MANAGER_ACCESS_LEVEL})
def handle_order(id):
    order = get_or_404(Order, id)

    if request.method == "GET":
        return make_response(order.to_dict(), 200)

    if request.method == "PATCH":
        if order.status == "closed":
            raise ValueError("Closed orders cannot be modified")

        data = get_json_object(ORDER_UPDATE_FIELDS)
        order_type = _validate_order_type(data.get("type", order.type))
        guests = _validate_guests(data.get("guests", order.guests))
        table_id = data.get("table_id", order.table_id)
        if data.get("type") == "take_out" and "table_id" not in data:
            table_id = None
        table = _locked_order_table(order_type, table_id, current_order_id=order.id)

        order.type = order_type
        order.guests = guests
        order.table_id = table.id if table is not None else None
        db.session.commit()
        return make_response(order.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(order)
        db.session.commit()
        return make_response({}, 204)


@order_bp.route("/<int:id>/items", methods=["GET"])
@access_level_required()
def get_order_items(id):
    order = get_or_404(Order, id)
    order_items = [order_item.to_dict() for order_item in order.order_items]
    return make_response(order_items, 200)
