import { useParams } from "react-router-dom";
import OrderItemsDisplay from "@orders/components/OrderItemsDisplay";
import { useAppSelector } from "@app/hooks";

function OrdersByTablePage() {
  const { tableId } = useParams<{ tableId: string }>();
  const tables = useAppSelector((state) => state.tables.tables);
  const table = tableId
    ? tables.find((currentTable) => currentTable.id === Number(tableId))
    : undefined;

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
