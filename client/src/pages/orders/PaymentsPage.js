import React from "react";
import { useLocation } from "react-router-dom";
import OrderDetails from "../../features/orders/OrderDetails";
import { PaymentIcon } from "react-svg-credit-card-payment-icons";

function PaymentsPage() {
  const location = useLocation();
  const { order } = location.state;

  console.log(order);

  return (
    <div className="">
      <div>
        <OrderDetails order={order} />
      </div>
      <div>
        <PaymentIcon type="visa" format="flatRounded" width={100} />
        <PaymentIcon type="mastercard" format="flatRounded" width={100} />
        <PaymentIcon type="amex" format="flatRounded" width={100} />
        <PaymentIcon type="discover" format="flatRounded" width={100} />
      </div>
    </div>
  );
}

export default PaymentsPage;
