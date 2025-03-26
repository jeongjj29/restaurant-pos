import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import { useDispatch } from "react-redux";
import { fetchTables } from "../features/tables/tablesSlice";
import { fetchOrders } from "../features/orders/ordersSlice";
import { fetchEmployees } from "../features/employees/employeesSlice";
import { fetchMenuItems } from "../features/menu/menuItemsSlice";
import { fetchMenuCategories } from "../features/menu/menuCategoriesSlice";
import { fetchPayments } from "../features/payments/paymentsSlice";
import { fetchOrderItems } from "../features/orders/orderItemsSlice";
import { fetchRoles } from "../features/employees/rolesSlice";

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

      <div className="flex-1 h-full p-6 shadow-inner overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
