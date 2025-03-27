from flask import Blueprint

base_bp = Blueprint("base_bp", __name__)

@base_bp.route("/")
def index():
    return "<h1>Server is running</h1>"