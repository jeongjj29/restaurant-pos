import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import DineInOrderInputPage from "./DineInOrderInputPage";

vi.mock("@orders/components/OrderInput", () => ({
  default: ({ tableId }: { tableId: number }) => (
    <p>Order input for table {tableId}</p>
  ),
}));

const renderPage = (tableId: string) =>
  render(
    <MemoryRouter initialEntries={[`/orders/table/${tableId}/new`]}>
      <Routes>
        <Route
          path="/orders/table/:tableId/new"
          element={<DineInOrderInputPage />}
        />
      </Routes>
    </MemoryRouter>
  );

describe("DineInOrderInputPage", () => {
  it.each(["12abc", "0", "-2", "1.5"])(
    "rejects the invalid table id %s",
    (tableId) => {
      renderPage(tableId);

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Choose an existing table"
      );
      expect(screen.queryByText(/Order input for table/)).not.toBeInTheDocument();
    }
  );

  it("passes a valid positive integer table id to the order form", () => {
    renderPage("12");

    expect(screen.getByText("Order input for table 12")).toBeInTheDocument();
  });
});
