import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders(state, action) {
      state.orders = action.payload;
    },
    addOrder(state, action) {
      state.orders.push(action.payload);
    },
    updateOrder(state, action) {
      const index = state.orders.findIndex(
        (order) => order.id === action.payload.id
      );
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});
