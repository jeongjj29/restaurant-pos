import { OrderItem } from "@features/orders/types";

export interface MenuItem {
  id: number;
  name: string;
  secondary_name: string | null;
  description: string | null;
  price: number;
  image: string | null;
  category_id: number;
  order_items: OrderItem[];
  menu_category: MenuCategory;
}

export interface MenuItemsState {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
}

export interface MenuCategory {
  id: number;
  name: string;
  secondary_name: string | null;
  menu_items: MenuItem[];
}

export interface MenuCategoriesState {
  menuCategories: MenuCategory[];
  loading: boolean;
  error: string | null;
}

export interface AddMenuItemPayload {
  name: string;
  secondary_name: string | null;
  price: number;
  category_id: number;
}

export interface UpdateMenuItemPayload {
  id: number;
  name: string;
  secondary_name: string | null;
  price: number;
  category_id: number;
}

export interface AddMenuCategoryPayload {
  name: string;
  secondary_name: string | null;
}

export interface UpdateMenuCategoryPayload {
  id: number;
  name: string;
  secondary_name: string | null;
}
