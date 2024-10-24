import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import OrderDetails from "../../features/orders/OrderDetails";
import { PaymentIcon } from "react-svg-credit-card-payment-icons";
import PaymentForm from "../../features/payments/PaymentForm";

function PaymentsPage() {
  const location = useLocation();
  const { order } = location.state;

  const [paymentType, setPaymentType] = useState("");

  return (
    <div className="flex flex-row">
      <div className="">
        <OrderDetails order={order} />
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col gap-4">
          <button onClick={() => setPaymentType("visa")}>
            <PaymentIcon type="visa" format="flatRounded" width={100} />
          </button>
          <button onClick={() => setPaymentType("mastercard")}>
            <PaymentIcon type="mastercard" format="flatRounded" width={100} />
          </button>
          <button onClick={() => setPaymentType("amex")}>
            <PaymentIcon type="amex" format="flatRounded" width={100} />
          </button>
          <button onClick={() => setPaymentType("discover")}>
            <PaymentIcon type="discover" format="flatRounded" width={100} />
          </button>
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
