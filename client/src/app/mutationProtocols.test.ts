import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import employeesReducer, {
  deleteEmployee,
} from "@employees/slices/employeesSlice";
import rolesReducer, {
  deleteRole,
  fetchRoles,
  updateRole,
} from "@employees/slices/rolesSlice";
import menuCategoriesReducer, {
  deleteMenuCategory,
} from "@menu/slices/menuCategoriesSlice";
import menuItemsReducer, {
  deleteMenuItem,
} from "@menu/slices/menuItemsSlice";
import orderItemsReducer, {
  deleteOrderItem,
} from "@orders/slices/orderItemsSlice";
import ordersReducer, { deleteOrder } from "@orders/slices/ordersSlice";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const createStore = () =>
  configureStore({
    reducer: {
      employees: employeesReducer,
      roles: rolesReducer,
      menuCategories: menuCategoriesReducer,
      menuItems: menuItemsReducer,
      orderItems: orderItemsReducer,
      orders: ordersReducer,
    },
  });

describe("API mutation protocols", () => {
  beforeEach(() => {
    mockedAxios.patch.mockReset();
    mockedAxios.delete.mockReset();
    mockedAxios.delete.mockResolvedValue({ status: 204, data: "" });
  });

  it("PATCHes roles without putting the route id in the body", async () => {
    const role = { id: 4, name: "Manager", access_level: 4 };
    mockedAxios.patch.mockResolvedValue({ data: role });
    const store = createStore();
    store.dispatch(fetchRoles.fulfilled([role], "roles-request", undefined));

    await store.dispatch(updateRole(role)).unwrap();

    expect(mockedAxios.patch).toHaveBeenCalledWith("/api/roles/4", {
      name: "Manager",
      access_level: 4,
    });
  });

  it("uses route ids after successful 204 deletes", async () => {
    const store = createStore();

    await expect(store.dispatch(deleteEmployee(1)).unwrap()).resolves.toBe(1);
    await expect(store.dispatch(deleteRole(2)).unwrap()).resolves.toBe(2);
    await expect(store.dispatch(deleteMenuCategory(3)).unwrap()).resolves.toBe(
      3
    );
    await expect(store.dispatch(deleteMenuItem(4)).unwrap()).resolves.toBe(4);
    await expect(store.dispatch(deleteOrderItem(5)).unwrap()).resolves.toBe(5);
    await expect(store.dispatch(deleteOrder(6)).unwrap()).resolves.toBe(6);

    expect(mockedAxios.delete.mock.calls.map(([url]) => url)).toEqual([
      "/api/users/1",
      "/api/roles/2",
      "/api/menu_categories/3",
      "/api/menu_items/4",
      "/api/order_items/5",
      "/api/orders/6",
    ]);
  });
});
