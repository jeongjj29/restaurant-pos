import React from "react";
import App from "./components/App";
import Home from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ErrorPage from "./pages/ErrorPage";
import SettingsPage from "./pages/SettingsPage";
import MenuManagement from "./pages/MenuManagementPage";
import EmployeeManagement from "./pages/EmployeeManagementPage";
import TableManagement from "./pages/TableManagementPage";
import SalesReports from "./pages/SalesReportPage";
import OrdersPage from "./pages/OrdersPage";
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
        element: <OrdersPage />,
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
            element: <MenuManagement />,
          },
          {
            path: "employees",
            element: <EmployeeManagement />,
          },
          {
            path: "tables",
            element: <TableManagement />,
          },
          {
            path: "reports",
            element: <SalesReports />,
          },
        ],
      },
    ],
  },
];

export default routes;
