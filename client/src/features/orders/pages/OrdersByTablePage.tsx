import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OrderItemsDisplay from "@orders/components/OrderItemsDisplay";
import { Order, OrderItem } from "@orders/types"; // Adjust based on your actual types

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

function OrdersByTablePage() {
  const { tableId } = useParams<{ tableId: string }>();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);

  useEffect(() => {
    if (tableId) {
      axios.get(`/tables/${tableId}/orders`).then((res) => {
        setOrders(res.data);
      });
    }
  }, [tableId]);

  return (
    <div>
      {orders.map((order) => (
        <OrderItemsDisplay
          key={order.id}
          table={tableId}
          orderItems={order.order_items}
          orderId={order.id}
        />
      ))}
    </div>
  );
}

export default OrdersByTablePage;
