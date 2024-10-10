import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchTables = createAsyncThunk(
  "tables/fetchTables",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/tables");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  tables: [],
  loading: false,
  error: null,
};

const tablesSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    setTables(state, action) {
      state.tables = action.payload;
    },
    addTable(state, action) {
      state.tables.push(action.payload);
    },
    updateTable(state, action) {
      const index = state.tables.findIndex(
        (table) => table.id === action.payload.id
      );
      if (index !== -1) {
        state.tables[index] = action.payload;
      }
    },
    deleteTable(state, action) {
      state.tables = state.tables.filter(
        (table) => table.id !== action.payload
      );
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setTables,
  addTable,
  updateTable,
  deleteTable,
  setError,
  setLoading,
} = tablesSlice.actions;
export default tablesSlice.reducer;
