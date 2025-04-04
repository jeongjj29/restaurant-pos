import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { Order } from "@orders/types";
import { format, parseISO } from "date-fns";
import AllOrdersTable from "@orders/components/AllOrdersTable";
import OrderDetails from "@orders/components/OrderDetails";

function AllOrdersPage() {
  const navigate = useNavigate();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const [clickedOrder, setClickedOrder] = useState<Order | null>(null);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "open"
  );

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.created_at);
    const isInDateRange = orderDate >= startDate && orderDate <= endDate;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && order.status === "open") ||
      (statusFilter === "closed" && order.status === "closed");

    return isInDateRange && matchesStatus;
  });

  return (
    <div className="flex flex-row">
      <div className="flex flex-col">
        <div className="flex flex-row justify-end gap-4 mr-8">
          <div className="flex flex-col">
            <label>Start Date:</label>
            <input
              type="date"
              value={format(startDate, "yyyy-MM-dd")}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="border text-text-primary bg-white/5 border-border p-2 rounded-sm"
            />
          </div>
          <div className="flex flex-col">
            <label>End Date:</label>
            <input
              type="date"
              value={format(endDate, "yyyy-MM-dd")}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="border text-text-primary bg-white/5 border-border p-2 rounded-sm"
            />
          </div>

          <div className="flex flex-col">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "open" | "closed")
              }
              className="border text-text-primary bg-white/5 border-border p-2 rounded-sm"
            >
              <option value="all" className="bg-surface">
                All Orders
              </option>
              <option value="open" className="bg-surface">
                Open Orders
              </option>
              <option value="closed" className="bg-surface">
                Closed Orders
              </option>
            </select>
          </div>
        </div>

        <AllOrdersTable
          orders={filteredOrders}
          setClickedOrder={setClickedOrder}
        />
      </div>

      <div className="flex flex-row">
        <OrderDetails order={clickedOrder} />
        {clickedOrder && (
          <div className="flex flex-col justify-center items-center">
            <button className="bg-green-300 hover:bg-green-400 text-white font-bold py-2 px-4 m-4 rounded-sm">
              Print
            </button>
            <button
              onClick={() =>
                navigate("/orders/payment", { state: { order: clickedOrder } })
              }
              className="bg-green-300 hover:bg-green-400 text-white font-bold py-2 px-4 m-4 rounded-sm"
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
