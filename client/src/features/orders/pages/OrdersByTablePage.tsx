import axios from "@app/apiClient";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrderItemsDisplay from "@orders/components/OrderItemsDisplay";
import { useAppSelector } from "@app/hooks";
import { Order } from "@orders/types";

function OrdersByTablePage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const tables = useAppSelector((state) => state.tables.tables);
  const parsedTableId = Number(tableId);
  const validTableId = Number.isInteger(parsedTableId) && parsedTableId > 0;
  const table = validTableId
    ? tables.find((currentTable) => currentTable.id === parsedTableId)
    : undefined;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(validTableId);
  const [error, setError] = useState<string | null>(null);

  const loadOpenOrders = useCallback(async () => {
    if (!validTableId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Order[]>(
        `/api/tables/${parsedTableId}/orders`
      );
      setOrders(response.data.filter((order) => order.status === "open"));
    } catch (requestError) {
      setError(
        axios.isAxiosError(requestError)
          ? requestError.response?.data?.message || "Unable to load this table."
          : "Unable to load this table."
      );
    } finally {
      setLoading(false);
    }
  }, [parsedTableId, validTableId]);

  useEffect(() => {
    void loadOpenOrders();
  }, [loadOpenOrders]);

  if (!validTableId) {
    return <p role="alert" className="p-6 text-error">Invalid table number.</p>;
  }

  if (loading) {
    return <p className="p-6 text-text-secondary">Loading open orders…</p>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p role="alert" className="text-error">{error}</p>
        <button
          type="button"
          onClick={() => void loadOpenOrders()}
          className="accent-badge mt-4 rounded-lg px-4 py-2"
        >
          Try again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-semibold">
          No open orders{table ? ` at Table ${table.number}` : ""}
        </h1>
        <p className="mt-2 text-text-secondary">
          Start a new dine-in order for this table.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/orders/table/${parsedTableId}/new`)}
          className="accent-badge mt-4 rounded-lg px-4 py-2"
        >
          Start order
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-wrap gap-4 overflow-auto p-3 md:p-4">
      {orders.map((order) => (
        <OrderItemsDisplay key={order.id} order={order} />
      ))}
    </div>
  );
}

export default OrdersByTablePage;
