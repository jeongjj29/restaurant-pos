import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AddEmployeePayload,
  Employee,
  EmployeesState,
  UpdateEmployeePayload,
} from "@employees/types";
import {
  handlePendingState,
  handleFulfilledState,
  handleRejectedState,
} from "@utils/sliceUtils";

export const fetchEmployees = createAsyncThunk<
  Employee[],
  undefined,
  { rejectValue: string }
>("employees/fetchEmployees", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/users");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employees"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const addEmployee = createAsyncThunk<
  Employee,
  AddEmployeePayload,
  { rejectValue: string }
>("employees/addEmployee", async (newEmployee, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/users", newEmployee);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add employee"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const updateEmployee = createAsyncThunk<
  Employee,
  UpdateEmployeePayload,
  { rejectValue: string }
>("employees/updateEmployee", async (updatedEmployee, { rejectWithValue }) => {
  try {
    const response = await axios.patch(
      `/api/users/${updatedEmployee.id}`,
      updatedEmployee
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update employee"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const deleteEmployee = createAsyncThunk<
  Employee,
  number,
  { rejectValue: string }
>("employees/deleteEmployee", async (employeeId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`/api/users/${employeeId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete employee"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

const initialState: EmployeesState = {
  employees: [],
  loading: false,
  error: null,
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        fetchEmployees.fulfilled,
        (state, action: PayloadAction<Employee[]>) => {
          handleFulfilledState(state, action);
          state.employees = action.payload;
        }
      )
      .addCase(
        fetchEmployees.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(addEmployee.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        addEmployee.fulfilled,
        (state, action: PayloadAction<Employee>) => {
          handleFulfilledState(state, action);
          state.employees.push(action.payload);
        }
      )
      .addCase(
        addEmployee.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(updateEmployee.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        updateEmployee.fulfilled,
        (state, action: PayloadAction<Employee>) => {
          handleFulfilledState(state, action);
          state.employees = state.employees.map((employee) =>
            employee.id === action.payload.id ? action.payload : employee
          );
        }
      )
      .addCase(
        updateEmployee.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(deleteEmployee.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        deleteEmployee.fulfilled,
        (state, action: PayloadAction<Employee>) => {
          handleFulfilledState(state, action);
          state.employees = state.employees.filter(
            (employee) => employee.id !== action.payload.id
          );
        }
      )
      .addCase(
        deleteEmployee.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      );
  },
});

export default employeesSlice.reducer;
