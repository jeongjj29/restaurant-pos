import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "./ordersSlice";

function AllOrdersTable() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.orders);
  const error = useSelector((state) => state.orders.error);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (error) return <p>Error: {error}</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Order Number</th>
          <th>Order Date</th>
          <th>Table Number</th>
          <th>Order Status</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  );
}

export default AllOrdersTable;
