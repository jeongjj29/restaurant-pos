import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@app/store";
import routes from "@routes";
import "./index.css";

const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true,
  } as any,
});

const container = document.getElementById("root");
if (!container) throw new Error("Root container not found");

createRoot(container).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
