import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Order } from "@orders/types";
import Table from "./Table";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const orderWithStatus = (status: "open" | "closed") =>
  ({ id: status === "open" ? 1 : 2, status }) as Order;

describe("Dine-in table", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockedAxios.get.mockReset();
    mockedAxios.isAxiosError.mockReturnValue(true);
  });

  it("treats closed history as available and starts a new order", async () => {
    mockedAxios.get.mockResolvedValue({ data: [orderWithStatus("closed")] });
    render(
      <Table
        isTable
        tableId={4}
        number={4}
        orders={[orderWithStatus("closed")]}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Table 4, available" })
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/orders/table/4/new");
    });
  });

  it("marks a table occupied only for an open order and opens that order", async () => {
    mockedAxios.get.mockResolvedValue({ data: [orderWithStatus("open")] });
    render(
      <Table
        isTable
        tableId={9}
        number={9}
        orders={[orderWithStatus("closed"), orderWithStatus("open")]}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Table 9, occupied" })
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/orders/table/9");
    });
  });

  it("shows lookup loading and failure states instead of failing silently", async () => {
    mockedAxios.get.mockRejectedValue({
      response: { data: { message: "Order lookup unavailable" } },
    });
    render(<Table isTable tableId={6} number={6} orders={[]} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Table 6, available" })
    );

    expect(
      await screen.findByText("Order lookup unavailable")
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
