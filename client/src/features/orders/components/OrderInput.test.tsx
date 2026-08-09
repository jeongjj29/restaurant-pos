import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import OrderInput from "./OrderInput";
import menuCategoriesReducer from "@menu/slices/menuCategoriesSlice";
import menuItemsReducer, { updateMenuItem } from "@menu/slices/menuItemsSlice";
import ordersReducer from "@orders/slices/ordersSlice";
import runtimeConfigReducer from "@features/config/runtimeConfigSlice";
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

const categories = [
  { id: 1, name: "Mains", secondary_name: null, menu_items: [] },
  { id: 2, name: "Drinks", secondary_name: null, menu_items: [] },
] as MenuCategory[];

const menuItem = {
  id: 3,
  name: "Demo Burger",
  secondary_name: null,
  description: null,
  price: 9,
  image: null,
  category_id: 1,
  order_items: [],
  menu_category: categories[0],
} as MenuItem;

const completeOrder = {
  id: 21,
  type: "take_out",
  guests: 0,
  total_price: "9.90",
  status: "open",
  sales_tax: "0.10",
  user_id: 7,
  table_id: null,
  created_at: "2026-08-09T12:00:00Z",
  closed_at: null,
  user: {},
  table: null,
  order_items: [
    {
      id: 31,
      quantity: 1,
      price: "9.00",
      menu_item_id: 3,
      menu_item: menuItem,
    },
  ],
  payments: [],
};

const renderOrderInput = (salesTaxRate: number | null = 0.1) => {
  const store = configureStore({
    reducer: {
      menuCategories: menuCategoriesReducer,
      menuItems: menuItemsReducer,
      orders: ordersReducer,
      runtimeConfig: runtimeConfigReducer,
      tables: tablesReducer,
    },
    preloadedState: {
      menuCategories: {
        menuCategories: categories,
        loading: false,
        error: null,
      },
      menuItems: { menuItems: [menuItem], loading: false, error: null },
      orders: { orders: [], loading: false, error: null },
      runtimeConfig: {
        salesTaxRate,
        loading: salesTaxRate === null,
        error: null,
      },
      tables: { tables: [], loading: false, error: null },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <OrderInput />
      </MemoryRouter>
    </Provider>
  );

  return store;
};

describe("OrderInput", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockedAxios.post.mockReset();
    mockedAxios.isAxiosError.mockReturnValue(true);
  });

  it("uses the flat menu-item state and follows category moves immediately", async () => {
    const store = renderOrderInput();

    expect(
      await screen.findByRole("button", { name: "Demo Burger" })
    ).toBeInTheDocument();

    act(() => {
      store.dispatch(
        updateMenuItem.fulfilled(
          { ...menuItem, category_id: 2, menu_category: categories[1] },
          "move-item",
          { ...menuItem, category_id: 2 }
        )
      );
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Demo Burger" })
      ).not.toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole("button", { name: "Drinks" }));
    expect(
      screen.getByRole("button", { name: "Demo Burger" })
    ).toBeInTheDocument();
  });

  it("keeps submission disabled until server configuration is available", async () => {
    renderOrderInput(null);

    await userEvent.click(
      await screen.findByRole("button", { name: "Demo Burger" })
    );

    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading sales tax configuration"
    );
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("submits one atomic order request using the server tax preview", async () => {
    mockedAxios.post.mockResolvedValue({ data: completeOrder });
    const store = renderOrderInput();
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", { name: "Demo Burger" })
    );
    expect(screen.getByText("$0.90")).toBeInTheDocument();
    expect(screen.getByText("$9.90")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/orders/all", {
        replace: true,
      });
    });
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith("/api/orders", {
      type: "take_out",
      table_id: null,
      items: [{ menu_item_id: 3, quantity: 1 }],
    });
    expect(store.getState().orders.orders[0]).toMatchObject({
      id: 21,
      total_price: 9.9,
      order_items: [{ menu_item_id: 3, quantity: 1, price: 9 }],
    });
  });

  it("keeps local order state clean when the atomic request fails", async () => {
    mockedAxios.post.mockRejectedValue({
      response: { data: { message: "Menu item is unavailable" } },
    });
    const store = renderOrderInput();
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", { name: "Demo Burger" })
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Menu item is unavailable"
    );
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(store.getState().orders.orders).toEqual([]);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
