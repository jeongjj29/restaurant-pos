import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requests = vi.hoisted(() => ({
  fetchTables: vi.fn(() => ({ type: "tables/fetch" })),
  fetchOrders: vi.fn(() => ({ type: "orders/fetch" })),
  fetchEmployees: vi.fn(() => ({ type: "employees/fetch" })),
  fetchMenuItems: vi.fn(() => ({ type: "menuItems/fetch" })),
  fetchMenuCategories: vi.fn(() => ({ type: "menuCategories/fetch" })),
  fetchPayments: vi.fn(() => ({ type: "payments/fetch" })),
  fetchOrderItems: vi.fn(() => ({ type: "orderItems/fetch" })),
  fetchRoles: vi.fn(() => ({ type: "roles/fetch" })),
  fetchRuntimeConfig: vi.fn(() => ({ type: "runtimeConfig/fetch" })),
}));

vi.mock("@tables/slices/tablesSlice", () => ({
  fetchTables: requests.fetchTables,
}));
vi.mock("@orders/slices/ordersSlice", () => ({
  fetchOrders: requests.fetchOrders,
}));
vi.mock("@employees/slices/employeesSlice", () => ({
  fetchEmployees: requests.fetchEmployees,
}));
vi.mock("@menu/slices/menuItemsSlice", () => ({
  fetchMenuItems: requests.fetchMenuItems,
}));
vi.mock("@menu/slices/menuCategoriesSlice", () => ({
  fetchMenuCategories: requests.fetchMenuCategories,
}));
vi.mock("@payments/slices/paymentsSlice", () => ({
  fetchPayments: requests.fetchPayments,
}));
vi.mock("@orders/slices/orderItemsSlice", () => ({
  fetchOrderItems: requests.fetchOrderItems,
}));
vi.mock("@employees/slices/rolesSlice", () => ({
  fetchRoles: requests.fetchRoles,
}));
vi.mock("@features/config/runtimeConfigSlice", () => ({
  fetchRuntimeConfig: requests.fetchRuntimeConfig,
}));

import App from "./App";

const resourceState = { loading: false, error: null };
const resourceReducer = (state = resourceState) => state;

const renderApp = (accessLevel: number) => {
  const authState = {
    isAuthenticated: true,
    initialized: true,
    loading: false,
    error: null,
    user: {
      id: 1,
      username: "staff",
      first_name: "Demo",
      last_name: "Staff",
      email: "staff@example.com",
      phone_number: "0125550100",
      role_id: 1,
      created_at: "2026-01-01T00:00:00Z",
      role: { id: 1, name: "Staff", access_level: accessLevel },
    },
  };
  const store = configureStore({
    reducer: {
      auth: (state = authState) => state,
      employees: resourceReducer,
      roles: resourceReducer,
      menuItems: resourceReducer,
      menuCategories: resourceReducer,
      orders: resourceReducer,
      orderItems: resourceReducer,
      payments: resourceReducer,
      tables: resourceReducer,
      runtimeConfig: (state = {
        salesTaxRate: null,
        loading: false,
        error: null,
      }) => state,
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </Provider>
  );
};

describe("App bootstrap permissions", () => {
  beforeEach(() => {
    Object.values(requests).forEach((request) => request.mockClear());
  });

  it("does not request management-only data or show settings to staff", () => {
    renderApp(1);

    expect(requests.fetchEmployees).not.toHaveBeenCalled();
    expect(requests.fetchRoles).not.toHaveBeenCalled();
    expect(requests.fetchOrders).toHaveBeenCalledOnce();
    expect(requests.fetchRuntimeConfig).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
  });

  it("loads management data and shows settings to managers", () => {
    renderApp(4);

    expect(requests.fetchEmployees).toHaveBeenCalledOnce();
    expect(requests.fetchRoles).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });
});
