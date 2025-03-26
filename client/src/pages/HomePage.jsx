import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AllOrdersTable from "@features/orders/components/AllOrdersTable";

function Home() {
  const navigate = useNavigate();
  const orders = useSelector((state) => state.orders.orders);
  const user = useSelector((state) => state.auth.user);
  const userOrders = orders.filter((order) => order.user_id === user.id);

  const handleOrderClick = (order) => {
    navigate("/orders/payment", { state: { order } });
  };

  return (
    <div>
      <h1>Hello {user.first_name}</h1>
      <div>
        <h2 className="text-lg font-semibold ml-10 mt-10">Your Orders:</h2>
        <AllOrdersTable
          orders={userOrders}
          setClickedOrder={handleOrderClick}
        />
      </div>
    </div>
  );
}

export default Home;
