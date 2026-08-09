import axios from "@app/apiClient";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AddPaymentPayload, Payment, PaymentsState } from "@payments/types";
import {
  handlePendingState,
  handleFulfilledState,
  handleRejectedState,
} from "@utils/sliceUtils";

const normalizePayment = (payment: Payment): Payment => ({
  ...payment,
  amount: Number.isFinite(Number(payment.amount)) ? Number(payment.amount) : 0,
});

export const fetchPayments = createAsyncThunk<
  Payment[],
  undefined,
  { rejectValue: string }
>("payments/fetchPayments", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/payments");
    return response.data.map(normalizePayment);
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
  AddPaymentPayload,
  { rejectValue: string }
>("payments/addPayment", async (newPayment, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/payments", newPayment);
    return normalizePayment(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add payment"
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
      );
  },
});

export default paymentsSlice.reducer;
