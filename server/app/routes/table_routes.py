from flask import Blueprint, request, make_response
from app.authorization import MANAGER_ACCESS_LEVEL, access_level_required
from app.models import Table
from app.extensions import db
from .utils import get_json_object, get_or_404

table_bp = Blueprint("tables", __name__, url_prefix="/api/tables")
TABLE_FIELDS = {"number", "capacity", "location_x", "location_y"}


@table_bp.route("/", methods=["GET"])
@access_level_required()
def get_tables():
    tables = [table.to_dict() for table in Table.query.all()]
    return make_response(tables, 200)


@table_bp.route("/", methods=["POST"])
@access_level_required(MANAGER_ACCESS_LEVEL)
def create_table():
    data = get_json_object(TABLE_FIELDS)
    table = Table(
        number=data["number"],
        capacity=data["capacity"],
        location_x=data.get("location_x"),
        location_y=data.get("location_y"),
    )
    db.session.add(table)
    db.session.commit()
    return make_response(table.to_dict(), 201)


@table_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
@access_level_required(
    method_levels={"PATCH": MANAGER_ACCESS_LEVEL, "DELETE": MANAGER_ACCESS_LEVEL}
)
def handle_table(id):
    table = get_or_404(Table, id)

    if request.method == "GET":
        return make_response(table.to_dict(), 200)

    if request.method == "PATCH":
        data = get_json_object(TABLE_FIELDS)
        for key, value in data.items():
            setattr(table, key, value)
        db.session.commit()
        return make_response(table.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(table)
        db.session.commit()
        return make_response({}, 204)


@table_bp.route("/<int:id>/orders", methods=["GET"])
@access_level_required()
def get_open_table_orders(id):
    table = get_or_404(Table, id)
    orders = [order.to_dict() for order in table.orders if order.status == "open"]
    return make_response(orders, 200)
