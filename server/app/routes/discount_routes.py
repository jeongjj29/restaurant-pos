from flask import Blueprint, request, make_response
from app.models import Discount
from app.extensions import db

discount_bp = Blueprint("discounts", __name__, url_prefix="/api/discounts")

@discount_bp.route("/", methods=["GET"])
def get_discounts():
    discounts = [discount.to_dict() for discount in Discount.query.all()]
    return make_response(discounts, 200)

@discount_bp.route("/", methods=["POST"])
def create_discount():
    data = request.get_json()
    discount = Discount(**data)
    db.session.add(discount)
    db.session.commit()
    return make_response(discount.to_dict(), 201)

@discount_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
def handle_discount(id):
    discount = Discount.query.get_or_404(id)

    if request.method == "GET":
        return make_response(discount.to_dict(), 200)

    if request.method == "PATCH":
        for key, value in request.get_json().items():
            setattr(discount, key, value)
        db.session.commit()
        return make_response(discount.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(discount)
        db.session.commit()
        return make_response({}, 204)