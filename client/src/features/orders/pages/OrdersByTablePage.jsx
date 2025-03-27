import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OrderItemsDisplay from "@features/orders/components/OrderItemsDisplay";

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
          key={order.id}
          table={order.table}
          orderItems={order.order_items}
          orderId={order.id}
        />
      ))}
    </div>
  );
}

export default OrdersByTablePage;
