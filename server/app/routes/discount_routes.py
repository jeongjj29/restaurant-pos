from flask import Blueprint, request, make_response
from app.authorization import MANAGER_ACCESS_LEVEL, access_level_required
from app.models import Discount
from app.extensions import db
from .utils import get_json_object, get_or_404

discount_bp = Blueprint("discounts", __name__, url_prefix="/api/discounts")
DISCOUNT_FIELDS = {"name", "amount"}


@discount_bp.route("/", methods=["GET"])
@access_level_required()
def get_discounts():
    discounts = [discount.to_dict() for discount in Discount.query.all()]
    return make_response(discounts, 200)


@discount_bp.route("/", methods=["POST"])
@access_level_required(MANAGER_ACCESS_LEVEL)
def create_discount():
    data = get_json_object(DISCOUNT_FIELDS)
    discount = Discount(name=data["name"], amount=data["amount"])
    db.session.add(discount)
    db.session.commit()
    return make_response(discount.to_dict(), 201)


@discount_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
@access_level_required(
    method_levels={"PATCH": MANAGER_ACCESS_LEVEL, "DELETE": MANAGER_ACCESS_LEVEL}
)
def handle_discount(id):
    discount = get_or_404(Discount, id)

    if request.method == "GET":
        return make_response(discount.to_dict(), 200)

    if request.method == "PATCH":
        data = get_json_object(DISCOUNT_FIELDS)
        for key, value in data.items():
            setattr(discount, key, value)
        db.session.commit()
        return make_response(discount.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(discount)
        db.session.commit()
        return make_response({}, 204)
