import { Order } from "@orders/types"; // Make sure this type exists
import { FC } from "react";

interface AllOrdersTableProps {
  orders: Order[];
  setClickedOrder: (order: Order) => void;
}

const AllOrdersTable: FC<AllOrdersTableProps> = ({
  orders,
  setClickedOrder,
}) => {
  if (orders.length === 0) {
    return (
      <h1 className="mt-8 text-3xl text-text-secondary">No Orders Available</h1>
    );
  }

  return (
    <div className="overflow-x-auto w-full m-4 ml-6 border-border shadow-lg border rounded-md">
      <table className="min-w-full bg-surface text-text-primary overflow-hidden">
        <thead className="bg-white/ text-text-primary">
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
          {orders.map((order, index) => (
            <tr
              key={order.id}
              className={`${
                index % 2 === 0 ? "bg-white/10" : "bg-white/5"
              } hover:bg-surface/60 cursor-pointer transition-colors`}
              onClick={() => {
                if (order.status === "closed") return;
                setClickedOrder(order);
              }}
            >
              <td className="py-3 px-6">{order.id}</td>
              <td className="py-3 px-6">
                {new Date(order.created_at).toLocaleString()}
              </td>
              <td className="py-3 px-6">
                {order.type === "take_out" ? "TAKE-OUT" : "DINE-IN"}
              </td>
              <td className="py-3 px-6">
                <span
                  className={`${
                    order.status === "open" ? "bg-green-600" : "bg-red-500"
                  } text-white py-1 px-3 rounded-full text-sm`}
                >
                  {order.status.toUpperCase()}
                </span>
              </td>
              <td className="py-3 px-6">
                <span className="font-semibold text-lg">
                  ${order.total_price}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllOrdersTable;
