import { useParams } from "react-router-dom";
import OrderInput from "@orders/components/OrderInput";

function DineInOrderInputPage() {
  const tableId = useParams().tableId;
  return (
    <div>
      <OrderInput tableId={tableId} />
    </div>
  );
}

export default DineInOrderInputPage;
