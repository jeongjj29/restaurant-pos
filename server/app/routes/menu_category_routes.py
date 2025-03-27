from flask import Blueprint, request, make_response
from app.models import MenuCategory, MenuItem
from app.extensions import db

menu_category_bp = Blueprint("menu_categories", __name__, url_prefix="/api/menu_categories")

@menu_category_bp.route("/", methods=["GET", "POST"])
def get_menu_categories():
    menu_categories = [category.to_dict() for category in MenuCategory.query.all()]
    return make_response(menu_categories, 200)

@menu_category_bp.route("/", methods=["POST"])
def create_menu_category():
    data = request.get_json()
    menu_category = MenuCategory(**data)
    db.session.add(menu_category)
    db.session.commit()
    return make_response(menu_category.to_dict(), 201)

@menu_category_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
def handle_menu_category(id):
    menu_category = MenuCategory.query.get_or_404(id)

    if request.method == "GET":
        return make_response(menu_category.to_dict(), 200)

    if request.method == "PATCH":
        for key, value in request.get_json().items():
            setattr(menu_category, key, value)
        db.session.commit()
        return make_response(menu_category.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(menu_category)
        db.session.commit()
        return make_response({}, 204)
    
@menu_category_bp.route("/<int:id>/menu_items", methods=["GET"])
def get_menu_items(id):
    menu_items = [item.to_dict() for item in MenuItem.query.filter_by(menu_category_id=id).all()]
    return make_response(menu_items, 200)
