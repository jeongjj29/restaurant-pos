export interface MenuItem {
  id: number;
  name: string;
  secondary_name: string | null;
  description: string | null;
  price: number;
  image: string | null;
  category_id: number;
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
}

export interface MenuCategoriesState {
  menuCategories: MenuCategory[];
  loading: boolean;
  error: string | null;
}
