import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import tablesReducer, { deleteTable } from "./tablesSlice";
import { addOrder } from "@orders/slices/ordersSlice";
import type { Order } from "@orders/types";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

describe("tablesSlice", () => {
  beforeEach(() => {
    mockedAxios.delete.mockReset();
  });

  it("removes a table when the backend returns an empty 204 response", async () => {
    mockedAxios.delete.mockResolvedValue({ status: 204, data: undefined });
    const store = configureStore({
      reducer: { tables: tablesReducer },
      preloadedState: {
        tables: {
          tables: [
            {
              id: 8,
              number: 12,
              capacity: 4,
              location_x: null,
              location_y: null,
            },
          ],
          loading: false,
          error: null,
        },
      },
    });

    await expect(store.dispatch(deleteTable(8)).unwrap()).resolves.toBe(8);

    expect(mockedAxios.delete).toHaveBeenCalledWith("/api/tables/8");
    expect(store.getState().tables.tables).toEqual([]);
  });

  it("marks a table occupied from the complete atomic order response", () => {
    const store = configureStore({
      reducer: { tables: tablesReducer },
      preloadedState: {
        tables: {
          tables: [
            {
              id: 8,
              number: 12,
              capacity: 4,
              location_x: null,
              location_y: null,
              orders: [],
            },
          ],
          loading: false,
          error: null,
        },
      },
    });
    const order = {
      id: 21,
      type: "dine_in",
      table_id: 8,
      status: "open",
      order_items: [],
      payments: [],
    } as unknown as Order;

    store.dispatch(
      addOrder.fulfilled(order, "create-order", {
        type: "dine_in",
        table_id: 8,
        items: [{ menu_item_id: 3, quantity: 1 }],
      })
    );

    expect(store.getState().tables.tables[0].orders).toEqual([order]);
  });
});
