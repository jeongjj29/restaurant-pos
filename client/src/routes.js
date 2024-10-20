import React from "react";
import App from "./components/App";
import Home from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ErrorPage from "./pages/ErrorPage";
import SettingsPage from "./pages/settings/SettingsPage";
import MenuManagementPage from "./pages/settings/MenuManagementPage";
import EmployeeManagementPage from "./pages/settings/EmployeeManagementPage";
import TableManagementPage from "./pages/settings/TableManagementPage";
import SalesReportsPage from "./pages/settings/SalesReportPage";
import OrdersManagementPage from "./pages/orders/OrdersManagementPage";
import DineInPage from "./pages/orders/DineInPage";
import TakeOutPage from "./pages/orders/TakeOutPage";
import AllOrdersPage from "./pages/orders/AllOrdersPage";
import PaymentsPage from "./pages/orders/PaymentsPage";
import ProtectedRoute from "./features/auth/ProtectedRoute"; // Import ProtectedRoute
import OrdersByTablePage from "./pages/orders/OrdersByTablePage";
import DineInOrderInputPage from "./pages/orders/DineInOrderInputPage";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Home />,
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
            element: (
              <ProtectedRoute>
                <DineInPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "table/:tableId",
            element: (
              <ProtectedRoute>
                <OrdersByTablePage />
              </ProtectedRoute>
            ),
          },
          {
            path: "table/:tableId/new",
            element: (
              <ProtectedRoute>
                <DineInOrderInputPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "takeout",
            element: (
              <ProtectedRoute>
                <TakeOutPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "all",
            element: (
              <ProtectedRoute>
                <AllOrdersPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "payment",
            element: (
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            ),
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
            element: (
              <ProtectedRoute>
                <MenuManagementPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "employees",
            element: (
              <ProtectedRoute>
                <EmployeeManagementPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "tables",
            element: (
              <ProtectedRoute>
                <TableManagementPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "reports",
            element: (
              <ProtectedRoute>
                <SalesReportsPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
];

export default routes;
