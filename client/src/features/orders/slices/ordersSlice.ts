import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AddOrderPayload,
  Order,
  OrdersState,
  UpdateOrderPayload,
} from "@orders/types";
import {
  handlePendingState,
  handleFulfilledState,
  handleRejectedState,
} from "@utils/sliceUtils";

export const fetchOrders = createAsyncThunk<
  Order[],
  undefined,
  { rejectValue: string }
>("orders/fetchOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/orders");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const addOrder = createAsyncThunk<
  Order,
  AddOrderPayload,
  { rejectValue: string }
>("orders/addOrder", async (newOrder, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/orders", newOrder);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add order"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const updateOrder = createAsyncThunk<
  Order,
  UpdateOrderPayload,
  { rejectValue: string }
>("orders/updateOrder", async (updatedOrder, { rejectWithValue }) => {
  try {
    const response = await axios.put(
      `/api/orders/${updatedOrder.id}`,
      updatedOrder
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const deleteOrder = createAsyncThunk<
  Order,
  number,
  { rejectValue: string }
>("orders/deleteOrder", async (orderId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`/api/orders/${orderId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete order"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        fetchOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          handleFulfilledState(state, action);
          state.orders = action.payload;
        }
      )
      .addCase(
        fetchOrders.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(addOrder.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(addOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        handleFulfilledState(state, action);
        state.orders.push(action.payload);
      })
      .addCase(
        addOrder.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(updateOrder.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(updateOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        handleFulfilledState(state, action);
        state.orders = state.orders.map((order) =>
          order.id === action.payload.id ? action.payload : order
        );
      })
      .addCase(
        updateOrder.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(deleteOrder.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(deleteOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        handleFulfilledState(state, action);
        state.orders = state.orders.filter(
          (order) => order.id !== action.payload.id
        );
      })
      .addCase(
        deleteOrder.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      );
  },
});

export default ordersSlice.reducer;
