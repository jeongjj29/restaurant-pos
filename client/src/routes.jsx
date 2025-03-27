import App from "@components/App";
import Home from "@pages/HomePage";
import LoginPage from "@pages/LoginPage";
import ErrorPage from "@pages/ErrorPage";
import SettingsPage from "@pages/settings/SettingsPage";
import MenuManagementPage from "@pages/settings/MenuManagementPage";
import EmployeeManagementPage from "@pages/settings/EmployeeManagementPage";
import TableManagementPage from "@pages/settings/TableManagementPage";
import SalesReportsPage from "@pages/settings/SalesReportPage";
import OrdersManagementPage from "@pages/orders/OrdersManagementPage";
import DineInPage from "@pages/orders/DineInPage";
import TakeOutPage from "@pages/orders/TakeOutPage";
import AllOrdersPage from "@pages/orders/AllOrdersPage";
import PaymentsPage from "@pages/orders/PaymentsPage";
import ProtectedRoute from "@features/auth/ProtectedRoute";
import OrdersByTablePage from "@pages/orders/OrdersByTablePage";
import DineInOrderInputPage from "@pages/orders/DineInOrderInputPage";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute>
            <OrdersManagementPage />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "dinein",
            element: <DineInPage />,
          },
          {
            path: "table/:tableId",
            element: <OrdersByTablePage />,
          },
          {
            path: "table/:tableId/new",
            element: <DineInOrderInputPage />,
          },
          {
            path: "takeout",
            element: <TakeOutPage />,
          },
          {
            path: "all",
            element: <AllOrdersPage />,
          },
          {
            path: "payment",
            element: <PaymentsPage />,
          },
        ],
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "menu",
            element: <MenuManagementPage />,
          },
          {
            path: "employees",
            element: <EmployeeManagementPage />,
          },
          {
            path: "tables",
            element: <TableManagementPage />,
          },
          {
            path: "reports",
            element: <SalesReportsPage />,
          },
        ],
      },
    ],
  },
];

export default routes;
