import { TAX } from "@constants";
import { OrderItem } from "@orders/types/orderTypes";

export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
};

export const subtotalPrice = (items: OrderItem[]): number =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0);

export const taxPrice = (items: OrderItem[]): number =>
  subtotalPrice(items) * TAX.RATE;

export const totalPriceWithTax = (items: OrderItem[]): number =>
  parseFloat((subtotalPrice(items) + taxPrice(items)).toFixed(2));
