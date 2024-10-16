import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchOrderItems = createAsyncThunk(
  "orderItems/fetchOrderItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/order_items");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addOrderItem = createAsyncThunk(
  "orderItems/addOrderItem",
  async (orderItemData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/order_items", orderItemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateOrderItem = createAsyncThunk(
  "orderItems/updateOrderItem",
  async (orderItemData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/order_items/${orderItemData.id}`,
        orderItemData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteOrderItem = createAsyncThunk(
  "orderItems/deleteOrderItem",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/order_items/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  orderItems: [],
  loading: false,
  error: null,
};

const orderItemsSlice = createSlice({
  name: "orderItems",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderItems.fulfilled, (state, action) => {
        state.loading = false;
        state.orderItems = action.payload;
      })
      .addCase(fetchOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addOrderItem.fulfilled, (state, action) => {
        state.orderItems.push(action.payload);
      })
      .addCase(addOrderItem.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateOrderItem.fulfilled, (state, action) => {
        const index = state.orderItems.findIndex(
          (orderItem) => orderItem.id === action.payload.id
        );
        if (index !== -1) {
          state.orderItems[index] = action.payload;
        }
      })
      .addCase(updateOrderItem.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteOrderItem.fulfilled, (state, action) => {
        const index = state.orderItems.findIndex(
          (orderItem) => orderItem.id === action.payload.id
        );
        if (index !== -1) {
          state.orderItems.splice(index, 1);
        }
      })
      .addCase(deleteOrderItem.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default orderItemsSlice.reducer;
