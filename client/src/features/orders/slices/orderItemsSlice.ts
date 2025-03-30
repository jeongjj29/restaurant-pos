import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { OrderItem, OrderItemsState } from "@orders/types";
import {
  handlePendingState,
  handleFulfilledState,
  handleRejectedState,
} from "@utils/sliceUtils";
import OrderItemsDisplay from "../components/OrderItemsDisplay";

export const fetchOrderItems = createAsyncThunk<
  OrderItem[],
  undefined,
  { rejectValue: string }
>("orderItems/fetchOrderItems", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/orderItems");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order items"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const addOrderItem = createAsyncThunk<
  OrderItem,
  OrderItem,
  { rejectValue: string }
>("orderItems/addOrderItem", async (newOrderItem, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/orderItems", newOrderItem);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add order item"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const updateOrderItem = createAsyncThunk<
  OrderItem,
  OrderItem,
  { rejectValue: string }
>(
  "orderItems/updateOrderItem",
  async (updatedOrderItem, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/orderItems/${updatedOrderItem.id}`,
        updatedOrderItem
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to update order item"
        );
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const deleteOrderItem = createAsyncThunk<
  OrderItem,
  number,
  { rejectValue: string }
>("orderItems/deleteOrderItem", async (orderItemId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`/api/orderItems/${orderItemId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete order item"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

const initialState: OrderItemsState = {
  orderItems: [],
  loading: false,
  error: null,
};

const tablesSlice = createSlice({
  name: "orderItems",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderItems.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        fetchOrderItems.fulfilled,
        (state, action: PayloadAction<OrderItem[]>) => {
          handleFulfilledState(state, action);
          state.orderItems = action.payload;
        }
      )
      .addCase(
        fetchOrderItems.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(addOrderItem.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        addOrderItem.fulfilled,
        (state, action: PayloadAction<OrderItem>) => {
          handleFulfilledState(state, action);
          state.orderItems.push(action.payload);
        }
      )
      .addCase(
        addOrderItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(updateOrderItem.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        updateOrderItem.fulfilled,
        (state, action: PayloadAction<OrderItem>) => {
          handleFulfilledState(state, action);
          state.orderItems = state.orderItems.map((item) =>
            item.id === action.payload.id ? action.payload : item
          );
        }
      )
      .addCase(
        updateOrderItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )

      .addCase(deleteOrderItem.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        deleteOrderItem.fulfilled,
        (state, action: PayloadAction<OrderItem>) => {
          handleFulfilledState(state, action);
          state.orderItems = state.orderItems.filter(
            (item) => item.id !== action.payload.id
          );
        }
      )
      .addCase(
        deleteOrderItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      );
  },
});

export default tablesSlice.reducer;
