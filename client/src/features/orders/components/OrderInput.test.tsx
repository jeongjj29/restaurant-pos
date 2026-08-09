import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import OrderInput from "./OrderInput";
import authReducer from "@auth/authSlice";
import menuCategoriesReducer from "@menu/slices/menuCategoriesSlice";
import orderItemsReducer from "@orders/slices/orderItemsSlice";
import ordersReducer from "@orders/slices/ordersSlice";
import tablesReducer from "@tables/slices/tablesSlice";
import type { MenuCategory, MenuItem } from "@menu/types";

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

const menuItem = {
  id: 3,
  name: "Demo Burger",
  secondary_name: null,
  description: null,
  price: 9,
  image: null,
  category_id: 1,
  order_items: [],
  menu_category: {},
} as unknown as MenuItem;

const category = {
  id: 1,
  name: "Mains",
  secondary_name: null,
  menu_items: [menuItem],
} as MenuCategory;

const renderOrderInput = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      menuCategories: menuCategoriesReducer,
      orderItems: orderItemsReducer,
      orders: ordersReducer,
      tables: tablesReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        token: "demo-token",
        user: {
          id: 7,
          username: "demo",
          first_name: "Demo",
          last_name: "User",
          email: "demo@example.com",
          phone_number: null,
          role_id: 1,
          created_at: "2026-08-09T12:00:00Z" as unknown as Date,
          role: { id: 1, name: "Admin", access_level: 5 },
        },
        loading: false,
        error: null,
      },
      menuCategories: {
        menuCategories: [category],
        loading: false,
        error: null,
      },
      orderItems: { orderItems: [], loading: false, error: null },
      orders: { orders: [], loading: false, error: null },
      tables: { tables: [], loading: false, error: null },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <OrderInput />
      </MemoryRouter>
    </Provider>
  );
};

describe("OrderInput", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockedAxios.post.mockReset();
    mockedAxios.isAxiosError.mockReturnValue(true);
  });

  it("blocks empty orders and stays on the form when a line item fails", async () => {
    mockedAxios.post.mockImplementation(async (url, payload) => {
      if (url === "/api/orders") {
        return {
          data: {
            id: 21,
            ...(payload as object),
            guests: 0,
            created_at: "2026-08-09T12:00:00Z",
            closed_at: null,
            user: {},
            table: null,
            order_items: [],
            payments: [],
          },
        };
      }
      throw {
        isAxiosError: true,
        response: { data: { message: "Could not add order item" } },
      };
    });
    renderOrderInput();
    const user = userEvent.setup();

    const submit = screen.getByRole("button", { name: "Submit" });
    expect(submit).toBeDisabled();
    expect(mockedAxios.post).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Demo Burger" }));
    await user.click(submit);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not add order item"
    );
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/api/orders",
      expect.objectContaining({ user_id: 7 })
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
