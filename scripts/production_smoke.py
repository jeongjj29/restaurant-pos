#!/usr/bin/env python3
"""Exercise the authenticated production lifecycle against the live HTTP API."""

from __future__ import annotations

import json
import os
import secrets
import sys
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from email.message import Message
from http.cookies import SimpleCookie
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import ProxyHandler, Request, build_opener


REQUEST_TIMEOUT_SECONDS = 15
MONEY_QUANTUM = Decimal("0.01")


class SmokeFailure(RuntimeError):
    """Raised when the production stack violates an expected API contract."""


@dataclass(frozen=True)
class ApiResponse:
    status: int
    payload: Any
    headers: Message


@dataclass(frozen=True)
class AuthCookies:
    access_token: str
    csrf_token: str

    def headers(self, *, include_csrf: bool = False) -> dict[str, str]:
        headers = {
            "Cookie": (
                f"access_token_cookie={self.access_token}; "
                f"csrf_access_token={self.csrf_token}"
            )
        }
        if include_csrf:
            headers["X-CSRF-TOKEN"] = self.csrf_token
        return headers


def required_environment(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SmokeFailure(f"Required environment variable {name} is not set")
    return value


def decode_json(body: bytes, path: str) -> Any:
    if not body:
        return None
    try:
        return json.loads(body)
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise SmokeFailure(f"{path} returned a non-JSON response") from error


def request_json(
    base_url: str,
    path: str,
    *,
    method: str = "GET",
    payload: dict[str, Any] | None = None,
    auth: AuthCookies | None = None,
) -> ApiResponse:
    headers = {"Accept": "application/json"}
    body = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    if auth is not None:
        headers.update(auth.headers(include_csrf=method not in {"GET", "HEAD"}))

    request = Request(
        f"{base_url.rstrip('/')}{path}",
        data=body,
        headers=headers,
        method=method,
    )
    opener = build_opener(ProxyHandler({}))
    try:
        with opener.open(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            return ApiResponse(
                response.status,
                decode_json(response.read(), path),
                response.headers,
            )
    except HTTPError as error:
        return ApiResponse(error.code, decode_json(error.read(), path), error.headers)
    except URLError as error:
        raise SmokeFailure(f"Could not reach {path}: {error.reason}") from error


def expect_object(response: ApiResponse, status: int, action: str) -> dict[str, Any]:
    if response.status != status:
        raise SmokeFailure(
            f"{action} returned HTTP {response.status}; expected HTTP {status}: "
            f"{response.payload!r}"
        )
    if not isinstance(response.payload, dict):
        raise SmokeFailure(f"{action} did not return a JSON object")
    return response.payload


def require_field(payload: dict[str, Any], field: str, action: str) -> Any:
    if field not in payload:
        raise SmokeFailure(f"{action} response is missing {field!r}")
    return payload[field]


def decimal_field(payload: dict[str, Any], field: str, action: str) -> Decimal:
    value = require_field(payload, field, action)
    try:
        result = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as error:
        raise SmokeFailure(f"{action} returned an invalid {field!r}") from error
    if not result.is_finite():
        raise SmokeFailure(f"{action} returned a non-finite {field!r}")
    return result


def auth_cookies(login_response: ApiResponse) -> AuthCookies:
    cookies: dict[str, tuple[str, bool]] = {}
    for header in login_response.headers.get_all("Set-Cookie", []):
        parsed = SimpleCookie()
        parsed.load(header)
        for name, morsel in parsed.items():
            cookies[name] = (morsel.value, bool(morsel["secure"]))

    required_names = ("access_token_cookie", "csrf_access_token")
    for name in required_names:
        if name not in cookies:
            raise SmokeFailure(f"Login did not set the {name} cookie")
        if not cookies[name][1]:
            raise SmokeFailure(f"Login cookie {name} is missing the Secure attribute")

    return AuthCookies(
        access_token=cookies["access_token_cookie"][0],
        csrf_token=cookies["csrf_access_token"][0],
    )


def verify_identity(base_url: str, username: str, auth: AuthCookies) -> None:
    me = expect_object(
        request_json(base_url, "/api/auth/me", auth=auth), 200, "Current-user lookup"
    )
    user = require_field(me, "user", "Current-user lookup")
    if not isinstance(user, dict) or user.get("username") != username:
        raise SmokeFailure("Current-user lookup returned the wrong user")


def create_fixture_records(
    base_url: str, auth: AuthCookies
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any], Decimal]:
    unique_suffix = secrets.token_hex(8)
    table_number = 1_000_000_000 + secrets.randbelow(1_000_000_000)

    category = expect_object(
        request_json(
            base_url,
            "/api/menu_categories",
            method="POST",
            payload={"name": f"CI category {unique_suffix}"},
            auth=auth,
        ),
        201,
        "Menu-category creation",
    )
    category_id = require_field(category, "id", "Menu-category creation")

    item_price = Decimal("12.34")
    item = expect_object(
        request_json(
            base_url,
            "/api/menu_items",
            method="POST",
            payload={
                "name": f"CI item {unique_suffix}",
                "price": float(item_price),
                "category_id": category_id,
            },
            auth=auth,
        ),
        201,
        "Menu-item creation",
    )

    table = expect_object(
        request_json(
            base_url,
            "/api/tables",
            method="POST",
            payload={"number": table_number, "capacity": 4},
            auth=auth,
        ),
        201,
        "Table creation",
    )
    return category, item, table, item_price


def create_concurrent_order(
    barrier: threading.Barrier,
    base_url: str,
    auth: AuthCookies,
    payload: dict[str, Any],
) -> ApiResponse:
    try:
        barrier.wait(timeout=REQUEST_TIMEOUT_SECONDS)
    except threading.BrokenBarrierError as error:
        raise SmokeFailure("Concurrent order requests could not synchronize") from error
    return request_json(
        base_url, "/api/orders", method="POST", payload=payload, auth=auth
    )


def verify_atomic_order_creation(
    base_url: str,
    auth: AuthCookies,
    menu_item_id: int,
    table_id: int,
    item_price: Decimal,
    sales_tax_rate: Decimal,
) -> dict[str, Any]:
    quantity = 2
    order_payload = {
        "type": "dine_in",
        "table_id": table_id,
        "items": [{"menu_item_id": menu_item_id, "quantity": quantity}],
    }
    barrier = threading.Barrier(2)
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [
            executor.submit(
                create_concurrent_order, barrier, base_url, auth, order_payload
            )
            for _ in range(2)
        ]
        responses = [future.result() for future in futures]

    if sorted(response.status for response in responses) != [201, 400]:
        outcomes = [(response.status, response.payload) for response in responses]
        raise SmokeFailure(
            "Concurrent same-table orders did not produce one success and one "
            f"rejection: {outcomes!r}"
        )

    accepted = next(response for response in responses if response.status == 201)
    rejected = next(response for response in responses if response.status == 400)
    if rejected.payload != {"message": "Table already has an open order"}:
        raise SmokeFailure(
            f"Concurrent same-table rejection was unexpected: {rejected.payload!r}"
        )

    order = expect_object(accepted, 201, "Atomic order creation")
    if order.get("status") != "open" or order.get("table_id") != table_id:
        raise SmokeFailure("Accepted dine-in order has incorrect status or table")
    if decimal_field(order, "sales_tax", "Atomic order creation") != sales_tax_rate:
        raise SmokeFailure("Order tax does not match the authenticated server config")

    expected_total = (item_price * quantity * (Decimal("1") + sales_tax_rate)).quantize(
        MONEY_QUANTUM, rounding=ROUND_HALF_UP
    )
    actual_total = decimal_field(order, "total_price", "Atomic order creation")
    if actual_total != expected_total:
        raise SmokeFailure(
            f"Server total {actual_total} does not match expected total {expected_total}"
        )

    order_id = require_field(order, "id", "Atomic order creation")
    persisted = expect_object(
        request_json(base_url, f"/api/orders/{order_id}", auth=auth),
        200,
        "Persisted order lookup",
    )
    if (
        decimal_field(persisted, "total_price", "Persisted order lookup")
        != expected_total
    ):
        raise SmokeFailure("Persisted order total differs from the creation response")
    return persisted


def pay_and_verify_closed(
    base_url: str, auth: AuthCookies, order: dict[str, Any]
) -> None:
    order_id = require_field(order, "id", "Persisted order lookup")
    total = decimal_field(order, "total_price", "Persisted order lookup")
    payment = expect_object(
        request_json(
            base_url,
            "/api/payments",
            method="POST",
            payload={"amount": f"{total:.2f}", "type": "cash", "order_id": order_id},
            auth=auth,
        ),
        201,
        "Exact payment",
    )
    if decimal_field(payment, "amount", "Exact payment") != total:
        raise SmokeFailure("Payment response amount differs from the order total")

    closed = expect_object(
        request_json(base_url, f"/api/orders/{order_id}", auth=auth),
        200,
        "Closed-order lookup",
    )
    if closed.get("status") != "closed" or not closed.get("closed_at"):
        raise SmokeFailure("Exactly paid order was not closed")
    if decimal_field(closed, "total_price", "Closed-order lookup") != total:
        raise SmokeFailure("Closed order total changed after payment")


def run_smoke() -> None:
    base_url = os.environ.get("SMOKE_BASE_URL", "http://127.0.0.1:8080").strip()
    username = required_environment("SMOKE_USERNAME")
    password = required_environment("SMOKE_PASSWORD")

    login_response = request_json(
        base_url,
        "/api/auth/login",
        method="POST",
        payload={"username": username, "password": password},
    )
    login = expect_object(login_response, 200, "Login")
    login_user = require_field(login, "user", "Login")
    if not isinstance(login_user, dict) or login_user.get("username") != username:
        raise SmokeFailure("Login returned the wrong user")
    auth = auth_cookies(login_response)

    verify_identity(base_url, username, auth)
    config = expect_object(
        request_json(base_url, "/api/config", auth=auth),
        200,
        "Authenticated config lookup",
    )
    sales_tax_rate = decimal_field(
        config, "sales_tax_rate", "Authenticated config lookup"
    )
    if sales_tax_rate < 0 or sales_tax_rate > 1:
        raise SmokeFailure("Authenticated config returned an invalid sales-tax rate")

    _, item, table, item_price = create_fixture_records(base_url, auth)
    menu_item_id = require_field(item, "id", "Menu-item creation")
    table_id = require_field(table, "id", "Table creation")
    order = verify_atomic_order_creation(
        base_url,
        auth,
        menu_item_id,
        table_id,
        item_price,
        sales_tax_rate,
    )
    pay_and_verify_closed(base_url, auth, order)

    logout = expect_object(
        request_json(base_url, "/api/auth/logout", method="POST", auth=auth),
        200,
        "Logout",
    )
    if logout.get("message") != "Successfully logged out":
        raise SmokeFailure("Logout returned an unexpected response")

    revoked = request_json(base_url, "/api/auth/me", auth=auth)
    if revoked.status != 401:
        raise SmokeFailure(
            "The logged-out session still authorizes current-user access"
        )


def main() -> int:
    try:
        run_smoke()
    except SmokeFailure as error:
        print(f"Production lifecycle smoke failed: {error}", file=sys.stderr)
        return 1
    print(
        "Production lifecycle smoke passed: authentication, config, atomic ordering, "
        "totals, payment, closure, and logout"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
