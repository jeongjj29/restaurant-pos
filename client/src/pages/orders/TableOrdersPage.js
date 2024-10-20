import React from "react";
import { useParams } from "react-router-dom";

function TableOrdersPage() {
  const tableNumber = useParams().tableNumber;
  console.log(tableNumber);
  return <div>TableOrdersPage</div>;
}

export default TableOrdersPage;
