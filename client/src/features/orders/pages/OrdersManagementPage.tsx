import { Outlet } from "react-router-dom";

const OrdersManagementPage: React.FC = () => {
  return (
    <div className="h-full rounded-2xl">
      <Outlet />
    </div>
  );
};

export default OrdersManagementPage;
