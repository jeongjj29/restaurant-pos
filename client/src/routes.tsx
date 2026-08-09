import { lazy, ReactElement, Suspense } from "react";
import { createBrowserRouter, RouteObject } from "react-router-dom";

import ErrorPage from "@pages/ErrorPage";
import ProtectedRoute from "@auth/ProtectedRoute";
import MinimumAccessRoute from "@auth/MinimumAccessRoute";
import { MANAGER_ACCESS_LEVEL } from "@auth/access";
import RouteLoading from "@components/RouteLoading";

const App = lazy(() => import("@components/App"));
const Home = lazy(() => import("@pages/HomePage"));
const LoginPage = lazy(() => import("@auth/LoginPage"));
const SettingsPage = lazy(() => import("@pages/SettingsPage"));
const MenuManagementPage = lazy(
  () => import("@menu/pages/MenuManagementPage")
);
const EmployeeManagementPage = lazy(
  () => import("@employees/pages/EmployeeManagementPage")
);
const TableManagementPage = lazy(
  () => import("@tables/pages/TableManagementPage")
);
const SalesReportsPage = lazy(() => import("@pages/SalesReportPage"));
const OrdersManagementPage = lazy(
  () => import("@orders/pages/OrdersManagementPage")
);
const DineInPage = lazy(() => import("@orders/pages/DineInPage"));
const TakeOutPage = lazy(() => import("@orders/pages/TakeOutPage"));
const AllOrdersPage = lazy(() => import("@orders/pages/AllOrdersPage"));
const PaymentsPage = lazy(() => import("@orders/pages/PaymentsPage"));
const OrdersByTablePage = lazy(
  () => import("@orders/pages/OrdersByTablePage")
);
const DineInOrderInputPage = lazy(
  () => import("@orders/pages/DineInOrderInputPage")
);

const loadable = (element: ReactElement) => (
  <Suspense fallback={<RouteLoading />}>{element}</Suspense>
);

const routes: RouteObject[] = [
  {
    path: "/login",
    element: loadable(<LoginPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        {loadable(<App />)}
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: loadable(<Home />),
      },
      {
        path: "orders",
        element: loadable(<OrdersManagementPage />),
        children: [
          { path: "dinein", element: loadable(<DineInPage />) },
          {
            path: "table/:tableId",
            element: loadable(<OrdersByTablePage />),
          },
          {
            path: "table/:tableId/new",
            element: loadable(<DineInOrderInputPage />),
          },
          { path: "takeout", element: loadable(<TakeOutPage />) },
          { path: "all", element: loadable(<AllOrdersPage />) },
          { path: "payment", element: loadable(<PaymentsPage />) },
        ],
      },
      {
        path: "settings",
        element: (
          <MinimumAccessRoute minimumAccessLevel={MANAGER_ACCESS_LEVEL}>
            {loadable(<SettingsPage />)}
          </MinimumAccessRoute>
        ),
        children: [
          { path: "menu", element: loadable(<MenuManagementPage />) },
          {
            path: "employees",
            element: loadable(<EmployeeManagementPage />),
          },
          { path: "tables", element: loadable(<TableManagementPage />) },
          { path: "reports", element: loadable(<SalesReportsPage />) },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
