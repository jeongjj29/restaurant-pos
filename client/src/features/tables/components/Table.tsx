import { useState } from "react";
import axios from "@app/apiClient";
import { useNavigate } from "react-router-dom";

import { Order } from "@orders/types";

interface TableProps {
  isTable: boolean;
  tableId: number | null;
  number: number | null;
  orders: Order[];
}

function Table({ isTable, tableId, number, orders }: TableProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const hasOpenOrder = orders.some((order) => order.status === "open");

  const handleClick = async () => {
    if (tableId === null || loading) return;

    setLoading(true);
    setFetchError(null);

    try {
      const response = await axios.get<Order[]>(`/api/tables/${tableId}/orders`);
      const openOrders = response.data.filter((order) => order.status === "open");

      navigate(
        openOrders.length > 0
          ? `/orders/table/${tableId}`
          : `/orders/table/${tableId}/new`
      );
    } catch (error: unknown) {
      setFetchError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Could not check this table"
          : "Could not check this table"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isTable) {
    return <div className="flex h-24 w-24 items-center justify-center rounded-lg" />;
  }

  return (
    <div className="flex w-24 flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={
          loading
            ? `Checking table ${number}`
            : `Table ${number}, ${hasOpenOrder ? "occupied" : "available"}`
        }
        className={`flex h-20 w-20 flex-col items-center justify-center rounded-xl border text-lg font-semibold transition-all duration-200 hover:-translate-y-[1px] disabled:cursor-wait disabled:opacity-70 ${
          hasOpenOrder
            ? "border-emerald-300/60 bg-emerald-500/25 text-emerald-100 hover:bg-emerald-500/35"
            : "border-border bg-white/8 text-text-primary hover:bg-white/14"
        }`}
      >
        <span>{loading ? "…" : number}</span>
        <span className="text-[0.65rem] font-medium uppercase tracking-wide opacity-80">
          {hasOpenOrder ? "In service" : "Available"}
        </span>
      </button>
      {fetchError && (
        <p
          role="alert"
          className="w-24 rounded-md bg-error/15 px-1 py-1 text-center text-[0.65rem] leading-tight text-error"
        >
          {fetchError}
        </p>
      )}
    </div>
  );
}

export default Table;
