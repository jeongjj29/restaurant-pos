import { MenuItem } from "@features/menu/types";

export interface Order {
  id: number;
  type: string;
  guests: number;
  total_price: number;
  status: string;
  sales_tax: number;
  user_id: number;
  table_id: number;
  created_at: Date;
  closed_at: Date;
}

export interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  discount_id: number;
  order_id: number;
  menu_item_id: number;
  order: Order;
  menu_item: MenuItem;
}

export interface OrderItemsState {
  orderItems: OrderItem[];
  loading: boolean;
  error: string | null;
}

export interface AddOrderPayload {
  type: string;
  total_price: number;
  status: string;
  sales_tax: number;
  user_id: number;
  table_id: number | null;
}

export interface AddOrderItemPayload {
  order_id: number;
  menu_item_id: number;
  price: number;
  quantity: number;
}
