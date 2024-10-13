import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch tables action
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

// Add a new table action
export const addNewTable = createAsyncThunk(
  "tables/addNewTable",
  async (tableData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/tables", tableData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update an existing table action
export const updateTable = createAsyncThunk(
  "tables/updateTable",
  async ({ tableId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/tables/${tableId}`, updatedData);
      return response.data; // Return the updated table
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteTable = createAsyncThunk(
  "tables/deleteTable",
  async (tableId, { rejectWithValue }) => {
    try {
      await axios.delete(`/tables/${tableId}`);
      return tableId;
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
  reducers: {},
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
      })
      .addCase(addNewTable.fulfilled, (state, action) => {
        state.tables.push(action.payload); // Add new table to tables
      })
      .addCase(addNewTable.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        const index = state.tables.findIndex(
          (table) => table.id === action.payload.id
        );
        if (index !== -1) {
          state.tables[index] = action.payload; // Update table in tables array
        }
      })
      .addCase(updateTable.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default tablesSlice.reducer;
