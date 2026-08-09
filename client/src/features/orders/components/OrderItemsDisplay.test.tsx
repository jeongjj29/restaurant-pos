import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Order } from "@orders/types";
import OrderItemsDisplay from "./OrderItemsDisplay";

const order = {
  id: 21,
  type: "take_out",
  total_price: 11,
  sales_tax: 0.1,
  order_items: [
    {
      id: 5,
      quantity: 1,
      price: 10,
      menu_item: { name: "Bulgogi" },
    },
  ],
} as Order;

describe("OrderItemsDisplay", () => {
  it("derives the exact tax amount from the server-owned total", () => {
    render(<OrderItemsDisplay order={order} />);

    expect(screen.getByText("$1.00")).toBeInTheDocument();
    expect(screen.getByText("$11.00")).toBeInTheDocument();
  });
});
