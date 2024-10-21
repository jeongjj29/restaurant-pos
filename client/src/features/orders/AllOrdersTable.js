import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "./ordersSlice";

function AllOrdersTable({ setClickedOrder }) {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.orders);
  const error = useSelector((state) => state.orders.error);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="overflow-x-auto w-1/2 m-8">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="py-2 px-4 text-left">Order Number</th>
            <th className="py-2 px-4 text-left">Order Date</th>
            <th className="py-2 px-4 text-left">Order Type</th>
            <th className="py-2 px-4 text-left">Order Status</th>
            <th className="py-2 px-4 text-left">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr
              key={order.id}
              className={index % 2 === 0 ? "bg-gray-100" : "bg-gray-50"}
              onClick={() => setClickedOrder(order)}
            >
              <td className="py-2 px-4">{order.id}</td>
              <td className="py-2 px-4">
                {new Date(order.created_at).toLocaleString()}
              </td>
              <td className="py-2 px-4">
                {order.type === "take_out" ? "TAKE-OUT" : "DINE-IN"}
              </td>
              <td className="py-2 px-4">{order.status.toUpperCase()}</td>
              <td className="py-2 px-4">${order.total_price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AllOrdersTable;
