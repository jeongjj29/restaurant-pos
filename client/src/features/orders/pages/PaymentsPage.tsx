import { useState } from "react";
import { useLocation } from "react-router-dom";
import OrderDetails from "@orders/components/OrderDetails";
import PaymentForm from "@payments/components/PaymentForm";
import { Order } from "@orders/types";

type PaymentType = "visa" | "mastercard" | "amex" | "discover" | "cash";

interface LocationState {
  order: Order;
}

function PaymentsPage() {
  const location = useLocation();
  const { order } = location.state as LocationState;

  const [paymentType, setPaymentType] = useState<PaymentType | "">("");

  return (
    <div className="flex flex-row">
      <div>
        <OrderDetails order={order} />
      </div>

      <div className="flex flex-row">
        <div className="flex flex-col gap-4">
          <button onClick={() => setPaymentType("visa")}>Visa</button>
          <button onClick={() => setPaymentType("mastercard")}>
            Mastercard
          </button>
          <button onClick={() => setPaymentType("amex")}>Amex</button>
          <button onClick={() => setPaymentType("discover")}>Discover</button>
          <button onClick={() => setPaymentType("cash")}>
            <div className="flex items-center justify-center bg-zinc-200 w-iconw py-3 h-18 border-2 rounded-lg p-0">
              <span className="text-3xl font-semibold">CASH</span>
            </div>
          </button>
        </div>

        {paymentType && (
          <div>
            <PaymentForm order={order} type={paymentType} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentsPage;
