import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { TABLES_LAYOUT_WIDTH, TABLES_LAYOUT_HEIGHT } from "../../constants";
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

const createTableLayout = (tables) => {
  const cols = TABLES_LAYOUT_HEIGHT;
  const rows = TABLES_LAYOUT_WIDTH;

  const layout = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ isTable: false }))
  );

  tables.forEach((table) => {
    if (table.location_x !== null && table.location_y !== null) {
      layout[table.location_y][table.location_x] = {
        isTable: true,
        ...table,
      };
    }
  });

  return layout;
};

const initialState = {
  tables: [],
  tableLayout: [],
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

        state.tableLayout = createTableLayout(state.tables);
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addNewTable.fulfilled, (state, action) => {
        state.tables.push(action.payload); // Add new table to tables

        state.tableLayout = createTableLayout(state.tables);
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

        state.tableLayout = createTableLayout(state.tables);
      })
      .addCase(updateTable.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.tables = state.tables.filter(
          (table) => table.id !== action.payload
        );

        state.tableLayout = createTableLayout(state.tables);
      })
      .addCase(deleteTable.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default tablesSlice.reducer;
