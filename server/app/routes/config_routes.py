from flask import Blueprint, make_response

from app.authorization import access_level_required
from app.order_totals import configured_sales_tax_rate


config_bp = Blueprint("config", __name__, url_prefix="/api/config")


@config_bp.route("", methods=["GET"])
@access_level_required()
def get_client_config():
    return make_response({"sales_tax_rate": float(configured_sales_tax_rate())}, 200)
