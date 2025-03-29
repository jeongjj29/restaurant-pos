import { TAX } from "@constants";
import { OrderItem } from "@orders/types";

export const subtotalPrice = (items: OrderItem[]): number =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0);

export const taxPrice = (items: OrderItem[]): number =>
  subtotalPrice(items) * TAX.RATE;

export const totalPriceWithTax = (items: OrderItem[]): number =>
  parseFloat((subtotalPrice(items) + taxPrice(items)).toFixed(2));
