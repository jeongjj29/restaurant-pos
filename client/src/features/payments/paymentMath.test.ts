import { describe, expect, it } from "vitest";
import { getPaidCents, getRemainingCents, moneyToCents } from "./paymentMath";
import type { Order } from "@orders/types";

describe("payment math", () => {
  it("normalizes API decimal strings without concatenating them", () => {
    const order = {
      total_price: "10.00",
      payments: [
        { id: 1, amount: "1.20", order_id: 4, type: "cash" },
        { id: 2, amount: 2.3, order_id: 4, type: "visa" },
      ],
    } as unknown as Pick<Order, "total_price" | "payments">;

    expect(getPaidCents(order)).toBe(350);
    expect(getRemainingCents(order)).toBe(650);
  });

  it("uses integer cents for exact settlement comparisons", () => {
    expect(moneyToCents(0.1 + 0.2)).toBe(30);
    expect(moneyToCents("8.77")).toBe(877);
  });
});
