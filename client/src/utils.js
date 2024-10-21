import { TAX_RATE } from "./constants";

export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const subtotalPrice = (items) =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0);

export const taxPrice = (items) => subtotalPrice(items) * TAX_RATE;

export const totalPriceWithTax = (items) =>
  parseFloat((subtotalPrice(items) + taxPrice(items)).toFixed(2));
