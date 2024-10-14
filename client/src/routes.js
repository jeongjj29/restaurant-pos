import React from "react";
import App from "./components/App";
import Home from "./pages/HomePage/Home";
import Login from "./pages/LoginPage/Login";
import ErrorPage from "./pages/ErrorPage";
import SettingsPage from "./pages/SettingsPage/SettingsPage";
import MenuManagement from "./pages/MenuManagementPage/MenuManagement";
import EmployeeManagement from "./pages/EmployeeManagementPage/EmployeeManagement";
import TableManagement from "./pages/TableManagementPage/TableManagement";
import SalesReports from "./pages/SalesReportsPage/SalesReports";
import OrdersPage from "./pages/OrdersPage/OrdersPage";

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
        element: <Login />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      }
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
