from flask import Blueprint, request, make_response
from app.authorization import MANAGER_ACCESS_LEVEL, access_level_required
from app.models import MenuCategory
from app.extensions import db
from .utils import get_json_object, get_or_404

menu_category_bp = Blueprint(
    "menu_categories", __name__, url_prefix="/api/menu_categories"
)
MENU_CATEGORY_FIELDS = {"name", "secondary_name"}


@menu_category_bp.route("/", methods=["GET"])
@access_level_required()
def get_menu_categories():
    menu_categories = [category.to_dict() for category in MenuCategory.query.all()]
    return make_response(menu_categories, 200)


@menu_category_bp.route("/", methods=["POST"])
@access_level_required(MANAGER_ACCESS_LEVEL)
def create_menu_category():
    data = get_json_object(MENU_CATEGORY_FIELDS)
    menu_category = MenuCategory(
        name=data["name"], secondary_name=data.get("secondary_name")
    )
    db.session.add(menu_category)
    db.session.commit()
    return make_response(menu_category.to_dict(), 201)


@menu_category_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
@access_level_required(
    method_levels={"PATCH": MANAGER_ACCESS_LEVEL, "DELETE": MANAGER_ACCESS_LEVEL}
)
def handle_menu_category(id):
    menu_category = get_or_404(MenuCategory, id)

    if request.method == "GET":
        return make_response(menu_category.to_dict(), 200)

    if request.method == "PATCH":
        data = get_json_object(MENU_CATEGORY_FIELDS)
        for key, value in data.items():
            setattr(menu_category, key, value)
        db.session.commit()
        return make_response(menu_category.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(menu_category)
        db.session.commit()
        return make_response({}, 204)


@menu_category_bp.route("/<int:id>/menu_items", methods=["GET"])
@access_level_required()
def get_menu_items(id):
    menu_category = get_or_404(MenuCategory, id)
    menu_items = [item.to_dict() for item in menu_category.menu_items]
    return make_response(menu_items, 200)
