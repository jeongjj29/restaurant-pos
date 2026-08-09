from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from flask import Blueprint, request, make_response
from app.models import Order, Payment
from app.extensions import db
from .utils import get_or_404

payment_bp = Blueprint("payments", __name__, url_prefix="/api/payments")
MONEY_QUANTUM = Decimal("0.01")


def _money(value, field_name):
    try:
        amount = Decimal(str(value)).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError(f"Invalid {field_name}") from None

    if not amount.is_finite():
        raise ValueError(f"Invalid {field_name}")
    return amount


@payment_bp.route("/", methods=["GET"])
def get_payments():
    payments = [payment.to_dict() for payment in Payment.query.all()]
    return make_response(payments, 200)


@payment_bp.route("/", methods=["POST"])
def create_payment():
    data = dict(request.get_json(silent=True) or {})
    order = get_or_404(Order, data["order_id"])
    amount = _money(data.get("amount"), "payment amount")

    if amount < 0:
        raise ValueError("Invalid payment amount")
    if amount == 0:
        raise ValueError("Payment amount must be greater than zero")
    if order.status == "closed":
        raise ValueError("Order is already closed")

    order_total = _money(order.total_price, "order total")
    paid_total = sum(
        (_money(payment.amount, "payment amount") for payment in order.payments),
        Decimal("0.00"),
    )
    remaining_balance = order_total - paid_total

    if remaining_balance <= 0:
        raise ValueError("Order balance is already paid")
    if amount > remaining_balance:
        raise ValueError(
            f"Payment exceeds remaining balance of ${remaining_balance:.2f}"
        )

    data["amount"] = amount
    payment = Payment(**data)
    db.session.add(payment)

    if amount == remaining_balance:
        order.status = "closed"
        order.closed_at = datetime.now(timezone.utc)

    db.session.commit()
    return make_response(payment.to_dict(), 201)


@payment_bp.route("/<int:id>", methods=["GET", "PATCH", "DELETE"])
def handle_payment(id):
    payment = get_or_404(Payment, id)

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
