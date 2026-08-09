import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import employeesReducer from "../slices/employeesSlice";
import rolesReducer from "../slices/rolesSlice";
import { Employee } from "@employees/types";
import EmployeeForm from "./EmployeeForm";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const employee: Employee = {
  id: 7,
  username: "alice",
  first_name: "Alice",
  last_name: "Smith",
  email: "alice@example.com",
  phone_number: "0125550100",
  role_id: 2,
  created_at: "2026-01-01T00:00:00Z",
  role: { id: 2, name: "Manager", access_level: 4 },
};

const renderForm = (employeeToEdit: Employee | null) => {
  const store = configureStore({
    reducer: {
      employees: employeesReducer,
      roles: rolesReducer,
    },
    preloadedState: {
      employees: { employees: employeeToEdit ? [employeeToEdit] : [], loading: false, error: null },
      roles: {
        roles: [
          { id: 1, name: "Admin", access_level: 5 },
          { id: 2, name: "Manager", access_level: 4 },
        ],
        loading: false,
        error: null,
      },
    },
  });
  const setFormHidden = vi.fn();
  const setSelectedEmployee = vi.fn();

  render(
    <Provider store={store}>
      <EmployeeForm
        employee={employeeToEdit}
        setFormHidden={setFormHidden}
        setSelectedEmployee={setSelectedEmployee}
      />
    </Provider>
  );

  return { setFormHidden, setSelectedEmployee };
};

describe("EmployeeForm", () => {
  beforeEach(() => {
    mockedAxios.patch.mockReset();
    mockedAxios.post.mockReset();
  });

  it("updates an employee without requiring or sending a password", async () => {
    mockedAxios.patch.mockResolvedValue({
      data: { ...employee, first_name: "Alicia" },
    });
    const { setFormHidden, setSelectedEmployee } = renderForm(employee);
    const user = userEvent.setup();

    expect(screen.queryByLabelText("Temporary password")).not.toBeInTheDocument();
    await user.clear(screen.getByLabelText("First name"));
    await user.type(screen.getByLabelText("First name"), "Alicia");
    await user.click(screen.getByRole("button", { name: "Save employee" }));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/users/7", {
        first_name: "Alicia",
        last_name: "Smith",
        phone_number: "0125550100",
        email: "alice@example.com",
        username: "alice",
        role_id: 2,
      });
    });
    expect(setSelectedEmployee).toHaveBeenCalledWith(null);
    expect(setFormHidden).toHaveBeenCalledWith(true);
  });

  it("requires a password when creating an employee", async () => {
    renderForm(null);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Create employee" }));

    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});
