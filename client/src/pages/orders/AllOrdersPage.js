import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AllOrdersTable from "../../features/orders/AllOrdersTable";
import OrderDetails from "../../features/orders/OrderDetails";
import { useSelector } from "react-redux";
import { format, parseISO } from "date-fns";

function AllOrdersPage() {
  const navigate = useNavigate();
  const orders = useSelector((state) => state.orders.orders);
  const [clickedOrder, setClickedOrder] = useState(null);

  // Initialize date filters to today's date
  const today = new Date();
  const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));
  const [statusFilter, setStatusFilter] = useState("open"); // 'all', 'open', 'closed'

  // Filter orders based on date range and status
  const filteredOrders = orders.filter((order) => {
    // Extract only the date from order.created_at and convert to yyyy-MM-dd format
    const orderDate = format(parseISO(order.created_at), "yyyy-MM-dd");

    const isInDateRange = orderDate >= startDate && orderDate <= endDate;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && order.status === "open") ||
      (statusFilter === "closed" && order.status === "closed");

    return isInDateRange && matchesStatus;
  });

  return (
    <div className="flex flex-row ">
      <div className="flex flex-col">
        {/* Filters */}
        <div className="flex flex-row justify-end gap-4 mr-8">
          {/* Date Range Filters */}
          <div className="flex flex-col">
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 p-2 rounded"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-col">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 p-2 rounded"
            >
              <option value="all">All Orders</option>
              <option value="open">Open Orders</option>
              <option value="closed">Closed Orders</option>
            </select>
          </div>
        </div>
        <AllOrdersTable
          setClickedOrder={setClickedOrder}
          orders={filteredOrders}
        />
      </div>

      {/* Orders Table and Details */}
      <div className="flex flex-row">
        <OrderDetails order={clickedOrder} />
        {clickedOrder && (
          <div className="flex flex-col justify-center items-center">
            <button className="bg-green-300 hover:bg-green-400 text-white font-bold py-2 px-4 m-4 rounded">
              Print
            </button>
            <button
              onClick={() => {
                const order = { ...clickedOrder };
                navigate("/orders/payment", { state: { order } });
              }}
              className="bg-green-300 hover:bg-green-400 text-white font-bold py-2 px-4 m-4 rounded"
            >
              Settle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllOrdersPage;
