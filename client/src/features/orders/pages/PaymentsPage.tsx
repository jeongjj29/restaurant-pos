import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import OrderDetails from "@orders/components/OrderDetails";
import PaymentForm from "@payments/components/PaymentForm";
import { Order } from "@orders/types";
import { PaymentType } from "@payments/types";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchOrders } from "@orders/slices/ordersSlice";
import { normalizeOrder } from "@orders/normalizers";

interface LocationState {
  order?: Order;
}

const paymentOptions: PaymentType[] = [
  "visa",
  "mastercard",
  "amex",
  "discover",
  "cash",
];

const parseOrderId = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

function PaymentsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationOrder = (location.state as LocationState | null)?.order;
  const orderId =
    parseOrderId(searchParams.get("orderId")) ?? locationOrder?.id ?? null;
  const orders = useAppSelector((state) => state.orders.orders);
  const storeOrder = orders.find((order) => order.id === orderId);
  const fallbackOrder = useMemo(
    () =>
      locationOrder?.id === orderId ? normalizeOrder(locationOrder) : undefined,
    [locationOrder, orderId]
  );
  const order = storeOrder ?? fallbackOrder;

  const [paymentType, setPaymentType] = useState<PaymentType | "">("");
  const [loading, setLoading] = useState(Boolean(orderId && !order));
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setLoadError(null);
    try {
      await dispatch(fetchOrders()).unwrap();
    } catch (error) {
      setLoadError(
        typeof error === "string"
          ? error
          : "Unable to load this order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  if (!orderId) {
    return (
      <div className="glass-panel mx-auto max-w-xl rounded-2xl p-6 text-center">
        <h1 className="text-2xl font-semibold">Choose an order to settle</h1>
        <p className="mt-2 text-text-secondary">
          Open an order first so its balance can be loaded safely.
        </p>
        <button
          type="button"
          onClick={() => navigate("/orders/all")}
          className="accent-badge mt-5 rounded-lg px-5 py-2.5"
        >
          View open orders
        </button>
      </div>
    );
  }

  if (loading && !order) {
    return <p className="p-6 text-text-secondary">Loading order #{orderId}…</p>;
  }

  if (loadError && !order) {
    return (
      <div className="glass-panel mx-auto max-w-xl rounded-2xl p-6 text-center">
        <p role="alert" className="text-error">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => void loadOrder()}
          className="accent-badge mt-4 rounded-lg px-5 py-2.5"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="glass-panel mx-auto max-w-xl rounded-2xl p-6 text-center">
        <p role="alert">Order #{orderId} could not be found.</p>
        <button
          type="button"
          onClick={() => navigate("/orders/all")}
          className="accent-badge mt-4 rounded-lg px-5 py-2.5"
        >
          Return to orders
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel flex h-full flex-col gap-4 rounded-2xl p-3 md:p-4 xl:flex-row">
      <div className="w-full xl:w-[420px]">
        <OrderDetails order={order} />
      </div>

      <div className="flex w-full flex-col gap-4">
        {loadError && (
          <p role="status" className="rounded-lg bg-warning/10 p-3 text-warning">
            Showing the available order details. Refresh failed: {loadError}
          </p>
        )}
        <h2 className="text-xl font-semibold">Choose payment type</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {paymentOptions.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setPaymentType(option)}
              aria-pressed={paymentType === option}
              disabled={order.status === "closed"}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                paymentType === option
                  ? "accent-badge border-transparent"
                  : "border-border bg-white/5 text-text-primary hover:bg-white/10"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {order.status === "closed" && (
          <p role="status" className="rounded-xl bg-success/10 p-4 text-success">
            This order is already settled.
          </p>
        )}

        {paymentType && order.status !== "closed" && (
          <PaymentForm order={order} type={paymentType} />
        )}
      </div>
    </div>
  );
}

export default PaymentsPage;
