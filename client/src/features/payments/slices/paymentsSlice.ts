import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Payment, PaymentsState } from "@payments/types";
import {
  handlePendingState,
  handleFulfilledState,
  handleRejectedState,
} from "@utils/sliceUtils";

export const fetchPayments = createAsyncThunk<
  Payment[],
  undefined,
  { rejectValue: string }
>("payments/fetchPayments", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/payments");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payments"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const addPayment = createAsyncThunk<
  Payment,
  Payment,
  { rejectValue: string }
>("payments/addPayment", async (newPayment, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/payments", newPayment);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add payment"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const updatePayment = createAsyncThunk<
  Payment,
  Payment,
  { rejectValue: string }
>("payments/updatePayment", async (updatedPayment, { rejectWithValue }) => {
  try {
    const response = await axios.put(
      `/api/payments/${updatedPayment.id}`,
      updatedPayment
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update payment"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const deletePayment = createAsyncThunk<
  Payment,
  number,
  { rejectValue: string }
>("payments/deletePayment", async (paymentId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`/api/payments/${paymentId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete payment"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

const initialState: PaymentsState = {
  payments: [],
  loading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        fetchPayments.fulfilled,
        (state, action: PayloadAction<Payment[]>) => {
          handleFulfilledState(state, action);
          state.payments = action.payload;
        }
      )
      .addCase(
        fetchPayments.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )
      .addCase(addPayment.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        addPayment.fulfilled,
        (state, action: PayloadAction<Payment>) => {
          handleFulfilledState(state, action);
          state.payments.push(action.payload);
        }
      )
      .addCase(
        addPayment.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )
      .addCase(updatePayment.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        updatePayment.fulfilled,
        (state, action: PayloadAction<Payment>) => {
          handleFulfilledState(state, action);
          state.payments = state.payments.map((payment) =>
            payment.id === action.payload.id ? action.payload : payment
          );
        }
      )
      .addCase(
        updatePayment.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )
      .addCase(deletePayment.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        deletePayment.fulfilled,
        (state, action: PayloadAction<Payment>) => {
          handleFulfilledState(state, action);
          state.payments = state.payments.filter(
            (payment) => payment.id !== action.payload.id
          );
        }
      )
      .addCase(
        deletePayment.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      );
  },
});

export default paymentsSlice.reducer;
