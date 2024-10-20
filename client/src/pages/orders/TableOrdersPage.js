import React from "react";
import { useParams } from "react-router-dom";

function TableOrdersPage() {
  const tableId = useParams().tableId;
  console.log(tableId);
  return <div>TableOrdersPage</div>;
}

export default TableOrdersPage;
