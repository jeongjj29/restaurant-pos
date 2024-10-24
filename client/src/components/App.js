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
    <div className="h-screen w-screen flex flex-row bg-gray-100">
      {/* NavBar with fixed width and full height */}
      <NavBar className="w-64 h-full bg-gray-800 shadow-lg" />

      {/* Outlet to take the remaining space */}
      <div className="flex-1 h-full p-6 bg-white shadow-inner overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
