import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { addOrder } from "./ordersSlice";

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

const initialState = {
  orderItems: [],
  loading: false,
  error: null,
};

const orderItemsSlice = createSlice({
  name: "orderItems",
  initialState,
  reducers: {
    setOrderItems: (state, action) => {
      state.orderItems = action.payload;
    },
    addOrderItems: (state, action) => {
      state.orderItems.push(action.payload);
    },
    updateOrderItems: (state, action) => {
      const index = state.orderItems.findIndex(
        (orderItem) => orderItem.id === action.payload.id
      );
      if (index !== -1) {
        state.orderItems[index] = action.payload;
      }
    },
    deleteOrderItems: (state, action) => {
      state.orderItems = state.orderItems.filter(
        (orderItem) => orderItem.id !== action.payload
      );
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
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
      });
  },
});

export const {
  setOrderItems,
  addOrderItems,
  updateOrderItems,
  deleteOrderItems,
  setError,
} = orderItemsSlice.actions;
export default orderItemsSlice.reducer;
