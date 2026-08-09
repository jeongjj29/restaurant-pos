import type { Order, OrderItem } from "@orders/types";

const toFiniteNumber = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeOrderItem = (item: OrderItem): OrderItem => ({
  ...item,
  price: toFiniteNumber(item.price),
  menu_item: item.menu_item
    ? {
        ...item.menu_item,
        price: toFiniteNumber(item.menu_item.price),
      }
    : item.menu_item,
});
/** Normalize API Decimal fields once, before they enter Redux state. */
export const normalizeOrder = (order: Order): Order => ({
  ...order,
  total_price: toFiniteNumber(order.total_price),
  sales_tax: toFiniteNumber(order.sales_tax),
  order_items: (order.order_items ?? []).map(normalizeOrderItem),
  payments: (order.payments ?? []).map((payment) => ({
    ...payment,
    amount: toFiniteNumber(payment.amount),
  })),
});
