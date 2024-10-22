import React from "react";
import { useSelector } from "react-redux";
import AllOrdersTable from "../features/orders/AllOrdersTable";

function Home() {
  const orders = useSelector((state) => state.orders.orders);
  const user = useSelector((state) => state.auth.user);
  const userOrders = orders.filter((order) => order.user_id === user.id);

  console.log(user);
  console.log(userOrders);

  return (
    <div>
      <h1>Hello {user.first_name}</h1>
      <div>
        <h2>Your Orders:</h2>
        <AllOrdersTable orders={userOrders} />
      </div>
    </div>
  );
}

export default Home;
