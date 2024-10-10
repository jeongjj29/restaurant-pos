import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMenuItems = createAsyncThunk(
  "menuItems/fetchMenuItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/menu_items");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  menuItems: [],
  loading: false,
  error: null,
};

const menuItemsSlice = createSlice({
  name: "menuItems",
  initialState,
  reducers: {
    setMenuItems(state, action) {
      state.menuItems = action.payload;
    },
    addMenuItem(state, action) {
      state.menuItems.push(action.payload);
    },
    updateMenuItem(state, action) {
      const index = state.menuItems.findIndex(
        (menuItem) => menuItem.id === action.payload.id
      );
      if (index !== -1) {
        state.menuItems[index] = action.payload;
      }
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = action.payload;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setMenuItems,
  addMenuItem,
  updateMenuItem,
  setError,
  setLoading,
} = menuItemsSlice.actions;
export default menuItemsSlice.reducer;
