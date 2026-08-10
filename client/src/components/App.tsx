import { useCallback, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./layout/NavBar";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchTables } from "@tables/slices/tablesSlice";
import { fetchOrders } from "@orders/slices/ordersSlice";
import { fetchEmployees } from "@employees/slices/employeesSlice";
import { fetchMenuItems } from "@menu/slices/menuItemsSlice";
import { fetchMenuCategories } from "@menu/slices/menuCategoriesSlice";
import { fetchPayments } from "@payments/slices/paymentsSlice";
import { fetchOrderItems } from "@orders/slices/orderItemsSlice";
import { fetchRoles } from "@employees/slices/rolesSlice";
import DataSyncStatus from "./DataSyncStatus";
import { hasMinimumAccess, MANAGER_ACCESS_LEVEL } from "@auth/access";
import { fetchRuntimeConfig } from "@features/config/runtimeConfigSlice";
import DemoNotice from "./DemoNotice";

function App() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const canViewManagementData = hasMinimumAccess(
    currentUser,
    MANAGER_ACCESS_LEVEL
  );
  const bootstrapped = useRef(false);

  const refreshData = useCallback(() => {
    void dispatch(fetchTables());
    void dispatch(fetchOrders());
    void dispatch(fetchMenuItems());
    void dispatch(fetchMenuCategories());
    void dispatch(fetchPayments());
    void dispatch(fetchOrderItems());
    void dispatch(fetchRuntimeConfig());
    if (canViewManagementData) {
      void dispatch(fetchEmployees());
      void dispatch(fetchRoles());
    }
  }, [canViewManagementData, dispatch]);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    refreshData();
  }, [refreshData]);

  return (
    <div className="flex h-screen flex-col gap-2 bg-transparent p-2 text-text-primary md:p-3">
      <DemoNotice />
      <div className="flex min-h-0 flex-1 flex-col gap-2 md:flex-row">
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
