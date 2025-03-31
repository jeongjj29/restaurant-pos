import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Table, TablesState, UpdateTablePayload } from "@tables/types";
import {
  handlePendingState,
  handleFulfilledState,
  handleRejectedState,
} from "@utils/sliceUtils";

export const fetchTables = createAsyncThunk<
  Table[],
  undefined,
  { rejectValue: string }
>("tables/fetchTables", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/tables");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tables"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const addTable = createAsyncThunk<Table, Table, { rejectValue: string }>(
  "tables/addTable",
  async (newTable, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/tables", newTable);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to add table"
        );
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const updateTable = createAsyncThunk<
  Table,
  UpdateTablePayload,
  { rejectValue: string }
>(
  "tables/updateTable",
  async ({ tableId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/tables/${tableId}`, updatedData);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to update table"
        );
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const deleteTable = createAsyncThunk<
  Table,
  number,
  { rejectValue: string }
>("tables/deleteTable", async (tableId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`/api/tables/${tableId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete table"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

const initialState: TablesState = {
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
        handlePendingState(state);
      })
      .addCase(
        fetchTables.fulfilled,
        (state, action: PayloadAction<Table[]>) => {
          handleFulfilledState(state, action);
          state.tables = action.payload;
        }
      )
      .addCase(
        fetchTables.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(addTable.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(addTable.fulfilled, (state, action: PayloadAction<Table>) => {
        handleFulfilledState(state, action);
        state.tables.push(action.payload);
      })
      .addCase(
        addTable.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(updateTable.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(updateTable.fulfilled, (state, action: PayloadAction<Table>) => {
        handleFulfilledState(state, action);
        state.tables = state.tables.map((table) =>
          table.id === action.payload.id ? action.payload : table
        );
      })
      .addCase(
        updateTable.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(deleteTable.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(deleteTable.fulfilled, (state, action: PayloadAction<Table>) => {
        handleFulfilledState(state, action);
        state.tables = state.tables.filter(
          (table) => table.id !== action.payload.id
        );
      })
      .addCase(
        deleteTable.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      );
  },
});

export default tablesSlice.reducer;
