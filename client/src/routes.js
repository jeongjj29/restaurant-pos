import React from "react";
import App from "./components/App";
import Home from "./pages/HomePage/Home";
import ErrorPage from "./pages/ErrorPage";

const routes = [
  {
    path: "/login",
    element: <h1>Login</h1>,
  },
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
];

export default routes;
