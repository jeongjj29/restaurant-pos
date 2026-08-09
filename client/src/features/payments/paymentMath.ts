import type { Order } from "@orders/types";

export type MoneyValue = number | string | null | undefined;

export const moneyToCents = (value: MoneyValue): number => {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
};

export const centsToMoney = (cents: number): number =>
  Math.round(cents) / 100;

export const getPaidCents = (order: Pick<Order, "payments">): number =>
  (order.payments ?? []).reduce(
    (total, payment) => total + moneyToCents(payment.amount),
    0
  );

export const getRemainingCents = (
  order: Pick<Order, "total_price" | "payments">
): number => Math.max(0, moneyToCents(order.total_price) - getPaidCents(order));
