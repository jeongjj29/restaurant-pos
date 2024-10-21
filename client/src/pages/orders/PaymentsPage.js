import React from "react";
import { useLocation } from "react-router-dom";
import OrderDetails from "../../features/orders/OrderDetails";
import { PaymentIcon } from "react-svg-credit-card-payment-icons";

function PaymentsPage() {
  const location = useLocation();
  const { order } = location.state;

  console.log(order);

  return (
    <div className="flex flex-row">
      <div className="">
        <OrderDetails order={order} />
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col gap-4">
          <button></button>
          <PaymentIcon type="visa" format="flatRounded" width={100} />
          <PaymentIcon type="mastercard" format="flatRounded" width={100} />
          <PaymentIcon type="amex" format="flatRounded" width={100} />
          <PaymentIcon type="discover" format="flatRounded" width={100} />
          <div className="flex items-center justify-center bg-zinc-200 w-iconw py-3 h-18 border-2 rounded-lg p-0">
            <span className="text-3xl font-semibold">CASH</span>
          </div>
        </div>
        <div>
          <h1>Payment Amount:</h1>
        </div>
      </div>
    </div>
  );
}

export default PaymentsPage;
