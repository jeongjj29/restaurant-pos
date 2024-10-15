import React from "react";
import AllOrdersTable from "../../features/orders/AllOrdersTable";
import OrderDetails from "../../features/orders/OrderDetails";

function AllOrdersPage() {
  const [clickedOrder, setClickedOrder] = React.useState(null);

  return (
    <div className="flex flex-row">
      <AllOrdersTable setClickedOrder={setClickedOrder} />
      <OrderDetails clickedOrder={clickedOrder} />
    </div>
  );
}

export default AllOrdersPage;
