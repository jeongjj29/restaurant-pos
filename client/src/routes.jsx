import App from "@components/App";
import Home from "@pages/HomePage";
import LoginPage from "@pages/LoginPage";
import ErrorPage from "@pages/ErrorPage";
import SettingsPage from "@pages/SettingsPage";
import MenuManagementPage from "@menu/pages/MenuManagementPage";
import EmployeeManagementPage from "@employees/pages/EmployeeManagementPage";
import TableManagementPage from "@tables/pages/TableManagementPage";
import SalesReportsPage from "@pages/SalesReportPage";
import OrdersManagementPage from "@orders/pages/OrdersManagementPage";
import DineInPage from "@orders/pages/DineInPage";
import TakeOutPage from "@orders/pages/TakeOutPage";
import AllOrdersPage from "@orders/pages/AllOrdersPage";
import PaymentsPage from "@orders/pages/PaymentsPage";
import ProtectedRoute from "@auth/ProtectedRoute";
import OrdersByTablePage from "@orders/pages/OrdersByTablePage";
import DineInOrderInputPage from "@orders/pages/DineInOrderInputPage";

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
