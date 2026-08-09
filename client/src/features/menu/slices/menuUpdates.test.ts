import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MenuCategory, MenuItem } from "@menu/types";
import menuCategoriesReducer, { updateMenuCategory } from "./menuCategoriesSlice";
import menuItemsReducer, { updateMenuItem } from "./menuItemsSlice";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const category = {
  id: 3,
  name: "Entrees",
  secondary_name: null,
  menu_items: [],
} as MenuCategory;

const menuItem = {
  id: 12,
  name: "Bulgogi",
  secondary_name: null,
  description: null,
  price: 24,
  image: null,
  category_id: 3,
  order_items: [],
  menu_category: category,
} as MenuItem;

describe("menu updates", () => {
  beforeEach(() => {
    mockedAxios.patch.mockReset();
  });

  it("PATCHes menu item changes without sending the route id in the body", async () => {
    mockedAxios.patch.mockResolvedValue({ data: { ...menuItem, price: 25 } });
    const store = configureStore({ reducer: { menuItems: menuItemsReducer } });

    await store
      .dispatch(
        updateMenuItem({
          id: 12,
          name: "Bulgogi",
          secondary_name: null,
          price: 25,
          category_id: 3,
        })
      )
      .unwrap();

    expect(mockedAxios.patch).toHaveBeenCalledWith("/api/menu_items/12", {
      name: "Bulgogi",
      secondary_name: null,
      price: 25,
      category_id: 3,
    });
  });

  it("PATCHes category changes using the backend-supported method", async () => {
    mockedAxios.patch.mockResolvedValue({ data: { ...category, name: "Mains" } });
    const store = configureStore({
      reducer: { menuCategories: menuCategoriesReducer },
    });

    await store
      .dispatch(
        updateMenuCategory({ id: 3, name: "Mains", secondary_name: null })
      )
      .unwrap();

    expect(mockedAxios.patch).toHaveBeenCalledWith("/api/menu_categories/3", {
      name: "Mains",
      secondary_name: null,
    });
  });
});
