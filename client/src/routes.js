import React from "react";
import App from "./components/App";
import Home from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ErrorPage from "./pages/ErrorPage";
import SettingsPage from "./pages/SettingsPage";
import MenuManagementPage from "./pages/MenuManagementPage";
import EmployeeManagementPage from "./pages/EmployeeManagementPage";
import TableManagementPage from "./pages/TableManagementPage";
import SalesReportsPage from "./pages/SalesReportPage";
import OrdersManagementPage from "./pages/OrdersManagementPage";
import TakeOutPage from "./pages/TakeOutPage";

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
        element: <OrdersManagementPage />,
        children: [
          {
            path: "takeout",
            element: <TakeOutPage />,
          },
        ],
      },
      {
        path: "settings",
        element: <SettingsPage />,
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
