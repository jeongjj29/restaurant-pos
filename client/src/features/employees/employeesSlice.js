import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/users");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addEmployee = createAsyncThunk(
  "employees/addEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/users", {
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        email: employeeData.email,
        username: employeeData.username,
        role_id: employeeData.role_id,
        password_hash: employeeData.password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/users/${employeeData.id}`, {
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        email: employeeData.email,
        username: employeeData.username,
        role_id: employeeData.role_id,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  employees: [],
  loading: false,
  error: null,
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setEmployees(state, action) {
      state.employees = action.payload;
    },

    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex(
          (employee) => employee.id === action.payload.id
        );
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const {
  setEmployees,

  setLoading,
  setError,
} = employeesSlice.actions;
export default employeesSlice.reducer;
