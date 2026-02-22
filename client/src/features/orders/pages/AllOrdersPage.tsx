import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { Order } from "@orders/types";
import { format } from "date-fns";
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
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const isInDateRange = orderDate >= start && orderDate <= end;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && order.status === "open") ||
      (statusFilter === "closed" && order.status === "closed");

    return isInDateRange && matchesStatus;
  });

  return (
    <div className="glass-panel flex h-full w-full flex-col xl:flex-row rounded-2xl p-3 md:p-4 gap-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-text-secondary">Start Date</label>
            <input
              type="date"
              value={format(startDate, "yyyy-MM-dd")}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="rounded-lg border border-border bg-white/5 p-2.5 text-text-primary"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-text-secondary">End Date</label>
            <input
              type="date"
              value={format(endDate, "yyyy-MM-dd")}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="rounded-lg border border-border bg-white/5 p-2.5 text-text-primary"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-text-secondary">Status</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "open" | "closed")
              }
              className="rounded-lg border border-border bg-white/5 p-2.5 text-text-primary"
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

      <div className="w-full xl:w-[380px]">
        <OrderDetails order={clickedOrder} />
        {clickedOrder && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="rounded-lg border border-border bg-white/5 px-4 py-2.5 font-semibold text-text-primary hover:bg-white/10">
              Print
            </button>
            <button
              onClick={() =>
                navigate("/orders/payment", { state: { order: clickedOrder } })
              }
              className="accent-badge rounded-lg px-4 py-2.5"
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
