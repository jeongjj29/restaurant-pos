import React from "react";
import App from "./components/App";
import Home from "./pages/HomePage/Home";
import Login from "./pages/LoginPage/Login";
import ErrorPage from "./pages/ErrorPage";
import BackOffice from "./pages/BackOfficePage/BackOffice";
import MenuManagement from "./pages/MenuManagementPage/MenuManagement";
import EmployeeManagement from "./pages/EmployeeManagementPage/EmployeeManagement";
import TableManagement from "./pages/TableManagementPage/TableManagement";
import SalesReports from "./pages/SalesReportsPage/SalesReports";

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
        path: "backoffice",
        element: <BackOffice />,
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
