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
    addEmployee(state, action) {
      state.employees.push(action.payload);
    },
    updateEmployee(state, action) {
      const index = state.employees.findIndex(
        (employee) => employee.id === action.payload.id
      );
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
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
      });
  },
});

export const {
  setEmployees,
  addEmployee,
  updateEmployee,
  setLoading,
  setError,
} = employeesSlice.actions;
export default employeesSlice.reducer;
