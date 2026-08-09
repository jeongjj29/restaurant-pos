import { NavLink, useParams } from "react-router-dom";
import OrderInput from "@orders/components/OrderInput";

function DineInOrderInputPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const numericTableId = tableId === undefined ? Number.NaN : Number(tableId);
  const validTableId = Number.isInteger(numericTableId) && numericTableId > 0;

  if (!validTableId) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="glass-panel max-w-md rounded-2xl p-6">
          <h1 className="text-2xl font-semibold">Invalid table</h1>
          <p role="alert" className="mt-2 text-error">
            Choose an existing table from the dining-room floor.
          </p>
          <NavLink
            to="/orders/dinein"
            className="accent-badge mt-4 inline-block rounded-lg px-4 py-2"
          >
            Back to tables
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <OrderInput tableId={numericTableId} />
    </div>
  );
}

export default DineInOrderInputPage;
