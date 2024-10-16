import React from "react";
import { useNavigate } from "react-router-dom";
import AllOrdersTable from "../../features/orders/AllOrdersTable";
import OrderDetails from "../../features/orders/OrderDetails";

function AllOrdersPage() {
  const navigate = useNavigate();
  const [clickedOrder, setClickedOrder] = React.useState(null);

  return (
    <div className="flex flex-row">
      <AllOrdersTable setClickedOrder={setClickedOrder} />
      <OrderDetails order={clickedOrder} />
      {clickedOrder && (
        <div className="flex flex-col justify-center items-center">
          <button className="bg-green-300 hover:bg-green-400 text-white font-bold py-2 px-4 m-4 rounded">
            Print
          </button>
          <button
            onClick={() => {
              const order = { ...clickedOrder };
              navigate("/orders/payment", { state: { order } });
            }}
            className="bg-green-300 hover:bg-green-400 text-white font-bold py-2 px-4 m-4 rounded"
          >
            Settle
          </button>
        </div>
      )}
    </div>
  );
}

export default AllOrdersPage;
