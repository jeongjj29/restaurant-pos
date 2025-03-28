export interface MenuItem {
  id: number;
  name: string;
  secondary_name: string | null;
  description: string | null;
  price: number;
  image: string | null;
  category_id: number;
}

export interface MenuCategory {
  id: number;
  name: string;
  secondary_name: string | null;
}
