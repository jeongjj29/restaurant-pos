import { useParams } from "react-router-dom";
import OrderInput from "@orders/components/OrderInput";

function DineInOrderInputPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const numericTableId = tableId ? parseInt(tableId, 10) : undefined;

  return (
    <div className="h-full">
      <OrderInput tableId={numericTableId} />
    </div>
  );
}

export default DineInOrderInputPage;
