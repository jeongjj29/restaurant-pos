import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import axios from "@app/apiClient";
import {
  handleFulfilledState,
  handlePendingState,
  handleRejectedState,
} from "@utils/sliceUtils";

export interface RuntimeConfigState {
  salesTaxRate: number | null;
  loading: boolean;
  error: string | null;
}

export const fetchRuntimeConfig = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("runtimeConfig/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<{ sales_tax_rate: number }>("/api/config");
    const salesTaxRate = Number(response.data.sales_tax_rate);

    if (!Number.isFinite(salesTaxRate) || salesTaxRate < 0 || salesTaxRate > 1) {
      return rejectWithValue("Server returned an invalid sales tax rate");
    }

    return salesTaxRate;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch runtime configuration"
      );
    }
    return rejectWithValue("Failed to fetch runtime configuration");
  }
});

const initialState: RuntimeConfigState = {
  salesTaxRate: null,
  loading: false,
  error: null,
};

const runtimeConfigSlice = createSlice({
  name: "runtimeConfig",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRuntimeConfig.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        fetchRuntimeConfig.fulfilled,
        (state, action: PayloadAction<number>) => {
          handleFulfilledState(state, action);
          state.salesTaxRate = action.payload;
        }
      )
      .addCase(
        fetchRuntimeConfig.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
          state.salesTaxRate = null;
        }
      );
  },
});

export default runtimeConfigSlice.reducer;
