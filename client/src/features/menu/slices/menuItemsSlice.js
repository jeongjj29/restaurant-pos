import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMenuItems = createAsyncThunk(
  "menuItems/fetchMenuItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/menu_items");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addMenuItem = createAsyncThunk(
  "menuItems/addMenuItem",
  async (menuItemData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/menu_items", menuItemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  "menuItems/updateMenuItem",
  async (menuItemData, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `/api/menu_items/${menuItemData.id}`,
        menuItemData
      );
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
  reducers: {},
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
      })
      .addCase(addMenuItem.fulfilled, (state, action) => {
        state.menuItems.push(action.payload);
      })
      .addCase(addMenuItem.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const index = state.menuItems.findIndex(
          (menuItem) => menuItem.id === action.payload.id
        );
        if (index !== -1) {
          state.menuItems[index] = action.payload;
        }
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default menuItemsSlice.reducer;
