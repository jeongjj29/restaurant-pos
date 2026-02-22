import axios from "axios";
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

  const handleClick = () => {
    axios
      .get<Order[]>(`/api/tables/${tableId}/orders`)
      .then((res) => {
        const tableOrders = res.data;
        if (tableOrders.length > 0) {
          navigate(`/orders/table/${tableId}`);
        } else {
          navigate(`/orders/table/${tableId}/new`);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch table orders:", err);
      });
  };

  if (!isTable) {
    return <div className="flex h-20 w-20 items-center justify-center rounded-lg" />;
  }

  return (
    <button
      onClick={handleClick}
      className={`flex h-20 w-20 items-center justify-center rounded-xl border text-lg font-semibold transition-all duration-200 hover:-translate-y-[1px] ${
        orders.length > 0
          ? "border-emerald-300/60 bg-emerald-500/25 text-emerald-100 hover:bg-emerald-500/35"
          : "border-border bg-white/8 text-text-primary hover:bg-white/14"
      }`}
    >
      {number}
    </button>
  );
}

export default Table;
