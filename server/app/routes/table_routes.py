from flask import Blueprint, request, make_response
from app.models import Table
from app.extensions import db

table_bp = Blueprint("tables", __name__, url_prefix="/api/tables")

@table_bp.route("/", methods=["GET"])
def get_tables():
    tables = [table.to_dict() for table in Table.query.all()]
    return make_response(tables, 200)

@table_bp.route("/", methods=["POST"])
def create_table():
    data = request.get_json()
    table = Table(**data)
    db.session.add(table)
    db.session.commit()
    return make_response(table.to_dict(), 201)

@table_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
def handle_table(id):
    table = Table.query.get_or_404(id)

    if request.method == "GET":
        return make_response(table.to_dict(), 200)

    if request.method == "PATCH":
        for key, value in request.get_json().items():
            setattr(table, key, value)
        db.session.commit()
        return make_response(table.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(table)
        db.session.commit()
        return make_response({}, 204)

@table_bp.route("/<int:id>/orders", methods=["GET"])
def get_open_table_orders(id):
    table = Table.query.get_or_404(id)
    orders = [order.to_dict() for order in table.orders if order.status == "open"]
    return make_response(orders, 200)
