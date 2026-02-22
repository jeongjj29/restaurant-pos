import { useState } from "react";
import { useLocation } from "react-router-dom";
import OrderDetails from "@orders/components/OrderDetails";
import PaymentForm from "@payments/components/PaymentForm";
import { Order } from "@orders/types";
import { PaymentType } from "@payments/types";

interface LocationState {
  order: Order;
}

function PaymentsPage() {
  const location = useLocation();
  const { order } = location.state as LocationState;

  const [paymentType, setPaymentType] = useState<PaymentType | "">("");

  const paymentOptions: PaymentType[] = [
    "visa",
    "mastercard",
    "amex",
    "discover",
    "cash",
  ];

  return (
    <div className="glass-panel flex h-full flex-col xl:flex-row gap-4 rounded-2xl p-3 md:p-4">
      <div className="w-full xl:w-[420px]">
        <OrderDetails order={order} />
      </div>

      <div className="flex w-full flex-col gap-4">
        <h2 className="text-xl font-semibold">Choose Payment Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {paymentOptions.map((option) => (
            <button
              key={option}
              onClick={() => setPaymentType(option)}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-all ${
                paymentType === option
                  ? "accent-badge border-transparent"
                  : "border-border bg-white/5 text-text-primary hover:bg-white/10"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {paymentType && (
          <div className="glass-panel rounded-xl p-4">
            <PaymentForm order={order} type={paymentType} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentsPage;
