from flask import Blueprint, request, make_response
from app.models import MenuItem
from app.extensions import db

menu_item_bp = Blueprint("menu_items", __name__, url_prefix="/api/menu_items")

@menu_item_bp.route("/", methods=["GET"])
def get_menu_items():
    menu_items = [item.to_dict() for item in MenuItem.query.all()]
    return make_response(menu_items, 200)

@menu_item_bp.route("/", methods=["POST"])
def create_menu_item():
    data = request.get_json()
    menu_item = MenuItem(**data)
    db.session.add(menu_item)
    db.session.commit()
    return make_response(menu_item.to_dict(), 201)

@menu_item_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
def handle_menu_item(id):
    menu_item = MenuItem.query.get_or_404(id)

    if request.method == "GET":
        return make_response(menu_item.to_dict(), 200)

    if request.method == "PATCH":
        for key, value in request.get_json().items():
            setattr(menu_item, key, value)
        db.session.commit()
        return make_response(menu_item.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(menu_item)
        db.session.commit()
        return make_response({}, 204)