import React from "react";
import OrderInput from "../../features/orders/OrderInput";
import { useParams } from "react-router-dom";

function DineInOrderInputPage() {
  const tableId = useParams().tableId;
  return (
    <div>
      <OrderInput tableId={tableId} />
    </div>
  );
}

export default DineInOrderInputPage;
