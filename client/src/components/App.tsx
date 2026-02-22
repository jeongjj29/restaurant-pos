import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./layout/NavBar";
import { useAppDispatch } from "@app/hooks";
import { fetchTables } from "@tables/slices/tablesSlice";
import { fetchOrders } from "@orders/slices/ordersSlice";
import { fetchEmployees } from "@employees/slices/employeesSlice";
import { fetchMenuItems } from "@menu/slices/menuItemsSlice";
import { fetchMenuCategories } from "@menu/slices/menuCategoriesSlice";
import { fetchPayments } from "@payments/slices/paymentsSlice";
import { fetchOrderItems } from "@orders/slices/orderItemsSlice";
import { fetchRoles } from "@employees/slices/rolesSlice";

function App() {
  const dispatch = useAppDispatch();

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
    <div className="h-screen bg-transparent text-text-primary p-2 md:p-3">
      <div className="flex h-full min-h-0 flex-col gap-2 md:flex-row">
        <aside className="w-full md:w-56 md:h-full">
          <NavBar />
        </aside>

        <main className="min-h-0 flex-1">
          <div className="section-shell glass-panel border-0 h-full min-h-0 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
