import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./layout/NavBar";
import { useDispatch } from "react-redux";
import { fetchTables } from "@tables/slices/tablesSlice";
import { fetchOrders } from "@orders/slices/ordersSlice";
import { fetchEmployees } from "@employees/slices/employeesSlice";
import { fetchMenuItems } from "@menu/slices/menuItemsSlice";
import { fetchMenuCategories } from "@menu/slices/menuCategoriesSlice";
import { fetchPayments } from "@payments/slices/paymentsSlice";
import { fetchOrderItems } from "@orders/slices/orderItemsSlice";
import { fetchRoles } from "@employees/slices/rolesSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTables());
    dispatch(fetchOrders());
    dispatch(fetchEmployees());
    dispatch(fetchMenuItems());
    dispatch(fetchMenuCategories());
    dispatch(fetchPayments());
    dispatch(fetchOrderItems());
    dispatch(fetchRoles());
  }, [dispatch]);

  return (
    <div className="flex h-screen flex-row bg-background text-text-primary">
      <div className="w-64 flex-none">
        <NavBar />
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
