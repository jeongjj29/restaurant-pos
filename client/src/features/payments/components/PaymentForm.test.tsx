import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PaymentForm from "./PaymentForm";
import ordersReducer from "@orders/slices/ordersSlice";
import paymentsReducer from "@payments/slices/paymentsSlice";
import tablesReducer from "@tables/slices/tablesSlice";
import type { Order } from "@orders/types";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const order = {
  id: 8,
  type: "take_out",
  guests: 0,
  total_price: "10.00",
  status: "open",
  sales_tax: "0.08875",
  user_id: 7,
  table_id: null,
  created_at: "2026-08-09T12:00:00Z",
  closed_at: null,
  user: {},
  table: null,
  order_items: [],
  payments: [{ id: 1, amount: "1.23", order_id: 8, type: "cash" }],
} as unknown as Order;

const renderForm = () => {
  const store = configureStore({
    reducer: {
      orders: ordersReducer,
      payments: paymentsReducer,
      tables: tablesReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <PaymentForm order={order} type="visa" />
      </MemoryRouter>
    </Provider>
  );
};

describe("PaymentForm", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockedAxios.post.mockReset();
    mockedAxios.get.mockReset();
    mockedAxios.patch.mockReset();
  });

  it("records the exact remaining balance and trusts refreshed server status", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { id: 2, amount: "8.77", order_id: 8, type: "visa" },
    });
    mockedAxios.get.mockImplementation(async (url) => {
      if (url === "/api/orders") {
        return {
          data: [
            {
              ...order,
              total_price: "10.00",
              status: "closed",
              payments: [
                ...order.payments,
                { id: 2, amount: "8.77", order_id: 8, type: "visa" },
              ],
            },
          ],
        };
      }
      if (url === "/api/payments") {
        return {
          data: [{ id: 2, amount: "8.77", order_id: 8, type: "visa" }],
        };
      }
      if (url === "/api/tables") return { data: [] };
      throw new Error(`Unexpected URL: ${url}`);
    });
    renderForm();

    expect(screen.getByLabelText("Payment amount")).toHaveValue(8.77);
    await userEvent.click(screen.getByRole("button", { name: "Record payment" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/orders/all", {
        replace: true,
      });
    });
    expect(mockedAxios.post).toHaveBeenCalledWith("/api/payments", {
      amount: 8.77,
      order_id: 8,
      type: "visa",
    });
    expect(mockedAxios.patch).not.toHaveBeenCalled();
  });
});
