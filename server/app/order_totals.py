from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from flask import current_app


DEFAULT_SALES_TAX_RATE = Decimal("0.08875")
MONEY_QUANTUM = Decimal("0.01")


def configured_sales_tax_rate():
    try:
        tax_rate = Decimal(
            str(current_app.config.get("SALES_TAX_RATE", DEFAULT_SALES_TAX_RATE))
        )
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError("Invalid server sales tax configuration") from None

    if not tax_rate.is_finite() or tax_rate < 0 or tax_rate > 1:
        raise ValueError("Invalid server sales tax configuration")
    return tax_rate


def recompute_order_total(order):
    subtotal = sum(
        (
            Decimal(str(order_item.price)) * order_item.quantity
            for order_item in order.order_items
        ),
        Decimal("0.00"),
    )
    tax_rate = Decimal(str(order.sales_tax))
    order.total_price = (subtotal * (Decimal("1.00") + tax_rate)).quantize(
        MONEY_QUANTUM, rounding=ROUND_HALF_UP
    )
    return order.total_price
