import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { subtotalPrice, taxPrice, totalPriceWithTax } from "../../utils";
import OrderItemsDisplay from "../../features/orders/OrderItemsDisplay";

function OrdersByTablePage() {
  const tableId = useParams().tableId;
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get(`/orders/table/${tableId}`).then((res) => {
      setOrders(res.data);
    });
  }, [tableId]);

  return (
    <div className="">
      {orders.map((order) => (
        <OrderItemsDisplay
          table={order.table}
          orderItems={order.order_items}
          orderId={order.id}
        />
      ))}
    </div>
  );
}

export default OrdersByTablePage;
