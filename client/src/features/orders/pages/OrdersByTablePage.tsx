import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OrderItemsDisplay from "@orders/components/OrderItemsDisplay";
import { Order, OrderItem } from "@orders/types"; // Adjust based on your actual types
import { useAppSelector } from "@app/hooks";
import { Table } from "@tables/types";

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

function OrdersByTablePage() {
  const { tableId } = useParams<{ tableId: string }>();
  const tables = useAppSelector((state) => state.tables.tables);
  const [table, setTable] = useState<Table | undefined>(undefined);

  useEffect(() => {
    if (tableId) {
      setTable(tables.find((table) => table.id === Number(tableId)));
    }
  });

  return (
    <div className="flex h-full">
      {table &&
        table.orders?.map((order) => (
          <OrderItemsDisplay
            key={order.id}
            table={table}
            orderItems={order.order_items}
            orderId={order.id}
          />
        ))}
    </div>
  );
}

export default OrdersByTablePage;
