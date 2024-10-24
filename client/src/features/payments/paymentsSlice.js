import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/payments");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addPayment = createAsyncThunk(
  "payments/addPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/payments", paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatedPayment = createAsyncThunk(
  "payments/updatedPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/payments/${paymentData.paymentId}`,
        paymentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deletePayment = createAsyncThunk(
  "payments/deletePayment",
  async (paymentId, { rejectWithValue }) => {
    try {
      await axios.delete(`/payments/${paymentId}`);
      return paymentId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  payments: [],
  isLoading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.payments.push(action.payload);
        state.isLoading = false;
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updatedPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatedPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(
          (payment) => payment.id === action.payload.id
        );
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        state.isLoading = false;
      })
      .addCase(updatedPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deletePayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(
          (payment) => payment.id !== action.payload
        );
        state.isLoading = false;
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default paymentsSlice.reducer;
