import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { MANAGER_ACCESS_LEVEL } from "./access";
import MinimumAccessRoute from "./MinimumAccessRoute";

const renderRoute = (accessLevel: number) => {
  const store = configureStore({
    reducer: {
      auth: () => ({
        user: { role: { access_level: accessLevel } },
      }),
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route path="/" element={<p>Dashboard</p>} />
          <Route
            path="/settings"
            element={
              <MinimumAccessRoute minimumAccessLevel={MANAGER_ACCESS_LEVEL}>
                <p>Management settings</p>
              </MinimumAccessRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe("MinimumAccessRoute", () => {
  it("redirects staff away from management routes", async () => {
    renderRoute(1);

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Management settings")).not.toBeInTheDocument();
  });

  it("allows managers to open management routes", () => {
    renderRoute(4);

    expect(screen.getByText("Management settings")).toBeInTheDocument();
  });
});
