import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ordersReducer, { fetchOrders, updateOrder } from "./ordersSlice";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const apiOrder = {
  id: 12,
  type: "dine_in",
  guests: 0,
  total_price: "10.50",
  status: "open",
  sales_tax: "0.08875",
  user_id: 7,
  table_id: 2,
  created_at: "2026-08-09T12:00:00Z",
  closed_at: null,
  user: {},
  table: {},
  order_items: [],
  payments: [{ id: 1, amount: "2.25", order_id: 12, type: "cash" }],
};

const createStore = () =>
  configureStore({
    reducer: { orders: ordersReducer },
  });

describe("orders thunks", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.patch.mockReset();
  });

  it("normalizes decimal strings returned by the API", async () => {
    mockedAxios.get.mockResolvedValue({ data: [apiOrder] });
    const store = createStore();

    const orders = await store.dispatch(fetchOrders()).unwrap();

    expect(orders[0].total_price).toBe(10.5);
    expect(orders[0].payments[0].amount).toBe(2.25);
  });

  it("updates orders with PATCH and does not send the id as a field", async () => {
    mockedAxios.patch.mockResolvedValue({
      data: { ...apiOrder, guests: 4, table_id: 3 },
    });
    const store = createStore();

    await store
      .dispatch(updateOrder({ id: 12, guests: 4, table_id: 3 }))
      .unwrap();

    expect(mockedAxios.patch).toHaveBeenCalledWith("/api/orders/12", {
      guests: 4,
      table_id: 3,
    });
  });
});
