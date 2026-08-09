import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Home from "./HomePage";

const renderHome = (accessLevel: number) => {
  const store = configureStore({
    reducer: {
      auth: () => ({
        user: {
          role: { access_level: accessLevel },
        },
      }),
      orders: () => ({ orders: [] }),
      employees: () => ({ employees: [] }),
      menuItems: () => ({ menuItems: [] }),
      tables: () => ({ tables: [] }),
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </Provider>
  );
};

describe("Home role-aware links", () => {
  it("hides employee data and routes staff to operational pages", () => {
    renderHome(1);

    expect(screen.queryByText("Team Members")).not.toBeInTheDocument();
    expect(screen.getByText("Menu Items").closest("a")).toHaveAttribute(
      "href",
      "/orders/takeout"
    );
    expect(screen.getByText("Dining Tables").closest("a")).toHaveAttribute(
      "href",
      "/orders/dinein"
    );
  });

  it("shows management links to managers", () => {
    renderHome(4);

    expect(screen.getByText("Team Members").closest("a")).toHaveAttribute(
      "href",
      "/settings/employees"
    );
    expect(screen.getByText("Menu Items").closest("a")).toHaveAttribute(
      "href",
      "/settings/menu"
    );
  });
});
