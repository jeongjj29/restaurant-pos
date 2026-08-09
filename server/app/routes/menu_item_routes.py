from flask import Blueprint, request, make_response
from app.authorization import MANAGER_ACCESS_LEVEL, access_level_required
from app.models import MenuItem
from app.extensions import db
from .utils import get_json_object, get_or_404

menu_item_bp = Blueprint("menu_items", __name__, url_prefix="/api/menu_items")
MENU_ITEM_FIELDS = {
    "name",
    "secondary_name",
    "description",
    "price",
    "image",
    "category_id",
}


@menu_item_bp.route("/", methods=["GET"])
@access_level_required()
def get_menu_items():
    menu_items = [item.to_dict() for item in MenuItem.query.all()]
    return make_response(menu_items, 200)


@menu_item_bp.route("/", methods=["POST"])
@access_level_required(MANAGER_ACCESS_LEVEL)
def create_menu_item():
    data = get_json_object(MENU_ITEM_FIELDS)
    menu_item = MenuItem(
        name=data["name"],
        secondary_name=data.get("secondary_name"),
        description=data.get("description"),
        price=data["price"],
        image=data.get("image"),
        category_id=data["category_id"],
    )
    db.session.add(menu_item)
    db.session.commit()
    return make_response(menu_item.to_dict(), 201)


@menu_item_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
@access_level_required(
    method_levels={"PATCH": MANAGER_ACCESS_LEVEL, "DELETE": MANAGER_ACCESS_LEVEL}
)
def handle_menu_item(id):
    menu_item = get_or_404(MenuItem, id)

    if request.method == "GET":
        return make_response(menu_item.to_dict(), 200)

    if request.method == "PATCH":
        data = get_json_object(MENU_ITEM_FIELDS)
        for key, value in data.items():
            setattr(menu_item, key, value)
        db.session.commit()
        return make_response(menu_item.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(menu_item)
        db.session.commit()
        return make_response({}, 204)
