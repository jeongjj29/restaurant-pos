import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import tablesReducer from "../slices/tablesSlice";
import { Table } from "@tables/types";
import TableForm from "./TableForm";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const existingTable: Table = {
  id: 3,
  number: 7,
  capacity: 4,
  location_x: null,
  location_y: null,
};

const renderForm = (tableToEdit: Table | null) => {
  const store = configureStore({
    reducer: { tables: tablesReducer },
    preloadedState: {
      tables: {
        tables: [existingTable],
        loading: false,
        error: null,
      },
    },
  });
  const setEditFormHidden = vi.fn();
  const setTableToEdit = vi.fn();

  render(
    <Provider store={store}>
      <TableForm
        tables={[existingTable]}
        tableToEdit={tableToEdit}
        setEditFormHidden={setEditFormHidden}
        setTableToEdit={setTableToEdit}
      />
    </Provider>
  );

  return { setEditFormHidden, setTableToEdit };
};

describe("TableForm", () => {
  beforeEach(() => {
    mockedAxios.patch.mockReset();
    mockedAxios.post.mockReset();
    mockedAxios.isAxiosError.mockReturnValue(true);
  });

  it("keeps an edit form open and displays update failures", async () => {
    mockedAxios.patch.mockRejectedValue({
      response: { data: { message: "Table update failed" } },
    });
    const { setEditFormHidden, setTableToEdit } = renderForm(existingTable);

    await userEvent.click(screen.getByRole("button", { name: "Update Table" }));

    expect(await screen.findByText("Table update failed")).toBeInTheDocument();
    expect(setEditFormHidden).not.toHaveBeenCalled();
    expect(setTableToEdit).not.toHaveBeenCalled();
  });

  it("keeps an add form open and displays creation failures", async () => {
    mockedAxios.post.mockRejectedValue({
      response: { data: { message: "Table creation failed" } },
    });
    const { setEditFormHidden } = renderForm(null);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Table Number"), "8");
    await user.type(screen.getByLabelText("Capacity"), "6");
    await user.click(screen.getByRole("button", { name: "Add Table" }));

    expect(await screen.findByText("Table creation failed")).toBeInTheDocument();
    expect(setEditFormHidden).not.toHaveBeenCalled();
  });
});
