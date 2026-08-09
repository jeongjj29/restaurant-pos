import { useCallback, useEffect, useRef } from "react";
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
import DataSyncStatus from "./DataSyncStatus";

function App() {
  const dispatch = useAppDispatch();
  const bootstrapped = useRef(false);

  const refreshData = useCallback(() => {
    void dispatch(fetchTables());
    void dispatch(fetchOrders());
    void dispatch(fetchEmployees());
    void dispatch(fetchMenuItems());
    void dispatch(fetchMenuCategories());
    void dispatch(fetchPayments());
    void dispatch(fetchOrderItems());
    void dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    refreshData();
  }, [refreshData]);

  return (
    <div className="h-screen bg-transparent text-text-primary p-2 md:p-3">
      <div className="flex h-full min-h-0 flex-col gap-2 md:flex-row">
        <aside className="w-full md:w-56 md:h-full">
          <NavBar />
        </aside>

        <main className="flex min-h-0 flex-1 flex-col">
          <DataSyncStatus onRetry={refreshData} />
          <div className="section-shell glass-panel min-h-0 flex-1 overflow-y-auto border-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
