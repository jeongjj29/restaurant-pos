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
        const orders = res.data;
        if (orders.length > 0) {
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
    return (
      <div className="flex items-center justify-center w-24 h-24 rounded-lg"></div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`text-2xl flex items-center justify-center w-24 h-24 border-2 rounded-lg text-white cursor-pointer ${
        orders.length > 0
          ? "bg-blue-500 hover:bg-blue-600"
          : "bg-gray-300 hover:bg-gray-400"
      }`}
    >
      {number}
    </div>
  );
}

export default Table;
