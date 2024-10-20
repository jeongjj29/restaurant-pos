import React from "react";
import { useParams } from "react-router-dom";

function OrdersByTablePage() {
  const tableId = useParams().tableId;
  console.log(tableId);
  return <div>OrdersByTablePage</div>;
}

export default OrdersByTablePage;
