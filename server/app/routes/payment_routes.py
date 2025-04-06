from flask import Blueprint, request, make_response
from app.models import Payment
from app.extensions import db

payment_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


@payment_bp.route("/", methods=["GET"])
def get_payments():
    payments = [payment.to_dict() for payment in Payment.query.all()]
    return make_response(payments, 200)

@payment_bp.route("/", methods=["POST"])    
def create_payment():
    data = request.get_json()
    payment = Payment(**data)
    db.session.add(payment)
    db.session.commit()
    return make_response(payment.to_dict(), 201)

@payment_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
def handle_payment(id):
    payment = Payment.query.get_or_404(id)

    if request.method == "GET":
        return make_response(payment.to_dict(), 200)

    if request.method == "PATCH":
        for key, value in request.get_json().items():
            setattr(payment, key, value)
        db.session.commit()
        return make_response(payment.to_dict(), 200)

    if request.method == "DELETE":
        db.session.delete(payment)
        db.session.commit()
        return make_response({}, 204)