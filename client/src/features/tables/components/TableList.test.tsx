import { DndContext } from "@dnd-kit/core";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import tablesReducer from "../slices/tablesSlice";
import { Table } from "@tables/types";
import TableList from "./TableList";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const table: Table = {
  id: 5,
  number: 7,
  capacity: 4,
  location_x: null,
  location_y: null,
};

const renderList = (tables: Table[]) => {
  const store = configureStore({
    reducer: { tables: tablesReducer },
    preloadedState: {
      tables: { tables, loading: false, error: null },
    },
  });

  render(
    <Provider store={store}>
      <DndContext>
        <TableList tables={tables} />
      </DndContext>
    </Provider>
  );
};

describe("TableList", () => {
  beforeEach(() => {
    mockedAxios.delete.mockReset();
    mockedAxios.isAxiosError.mockReturnValue(true);
  });

  it("shows an actionable empty state", () => {
    renderList([]);

    expect(screen.getByText(/No tables yet/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add a new table" })
    ).toBeInTheDocument();
  });

  it("provides accessible actions and displays delete failures", async () => {
    mockedAxios.delete.mockRejectedValue({
      response: { data: { message: "Table has an open order" } },
    });
    renderList([table]);

    expect(
      screen.getByRole("button", { name: "Edit table 7" })
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Delete table 7" })
    );

    expect(await screen.findByText("Table has an open order")).toBeInTheDocument();
  });
});
