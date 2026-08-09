import { Order } from "@orders/types";
import { FC } from "react";

interface AllOrdersTableProps {
  orders: Order[];
  selectedOrderId: number | null;
  setClickedOrder: (order: Order) => void;
}

const AllOrdersTable: FC<AllOrdersTableProps> = ({
  orders,
  selectedOrderId,
  setClickedOrder,
}) => {
  if (orders.length === 0) {
    return (
      <h1 className="mt-8 text-3xl text-text-secondary">No Orders Available</h1>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-md border border-border shadow-lg">
      <table className="min-w-full overflow-hidden bg-surface text-text-primary">
        <thead className="bg-white/5 text-text-primary">
          <tr>
            <th className="py-3 px-6 text-left text-md font-semibold">
              Order #
            </th>
            <th className="py-3 px-6 text-left text-md font-semibold">Date</th>
            <th className="py-3 px-6 text-left text-md font-semibold">Type</th>
            <th className="py-3 px-6 text-left text-md font-semibold">
              Status
            </th>
            <th className="py-3 px-6 text-left text-md font-semibold">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order, index) => {
            const selectable = order.status === "open";
            const selectOrder = () => {
              if (selectable) setClickedOrder(order);
            };

            return (
              <tr
                key={order.id}
                tabIndex={selectable ? 0 : undefined}
                aria-label={selectable ? `Select order ${order.id}` : undefined}
                aria-selected={selectedOrderId === order.id}
                onClick={selectOrder}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectOrder();
                  }
                }}
                className={`${
                  index % 2 === 0 ? "bg-white/10" : "bg-white/5"
                } ${
                  selectedOrderId === order.id ? "outline-2 outline-accent" : ""
                } ${
                  selectable
                    ? "cursor-pointer hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-accent"
                    : "cursor-default opacity-75"
                } transition-colors`}
              >
                <td className="px-6 py-3">{order.id}</td>
                <td className="px-6 py-3">
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  {order.type === "take_out" ? "TAKE-OUT" : "DINE-IN"}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm text-white ${
                      order.status === "open" ? "bg-green-700" : "bg-red-700"
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-lg font-semibold">
                    ${Number(order.total_price).toFixed(2)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AllOrdersTable;
