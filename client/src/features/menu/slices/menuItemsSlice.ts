import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AddMenuItemPayload,
  MenuItem,
  MenuItemsState,
  UpdateMenuItemPayload,
} from "@menu/types";
import {
  handlePendingState,
  handleFulfilledState,
  handleRejectedState,
} from "@utils/sliceUtils";

export const fetchMenuItems = createAsyncThunk<
  MenuItem[],
  undefined,
  { rejectValue: string }
>("menuItems/fetchMenuItems", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/menu_items");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch menu items"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const addMenuItem = createAsyncThunk<
  MenuItem,
  AddMenuItemPayload,
  { rejectValue: string }
>("menuItems/addMenuItem", async (newMenuItem, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/menu_items", newMenuItem);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add menu item"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const updateMenuItem = createAsyncThunk<
  MenuItem,
  UpdateMenuItemPayload,
  { rejectValue: string }
>("menuItems/updateMenuItem", async (updatedMenuItem, { rejectWithValue }) => {
  try {
    const response = await axios.put(
      `/api/menu_items/${updatedMenuItem.id}`,
      updatedMenuItem
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update menu item"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const deleteMenuItem = createAsyncThunk<
  MenuItem,
  number,
  { rejectValue: string }
>("menuItems/deleteMenuItem", async (menuItemId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`/api/menu_items/${menuItemId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete menu item"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

const initialState: MenuItemsState = {
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
        handlePendingState;
      })
      .addCase(
        fetchMenuItems.fulfilled,
        (state, action: PayloadAction<MenuItem[]>) => {
          handleFulfilledState(state, action);
          state.menuItems = action.payload;
        }
      )
      .addCase(
        fetchMenuItems.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )
      .addCase(addMenuItem.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        addMenuItem.fulfilled,
        (state, action: PayloadAction<MenuItem>) => {
          handleFulfilledState(state, action);
          state.menuItems.push(action.payload);
        }
      )
      .addCase(
        addMenuItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )
      .addCase(updateMenuItem.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        updateMenuItem.fulfilled,
        (state, action: PayloadAction<MenuItem>) => {
          handleFulfilledState(state, action);
          state.menuItems = state.menuItems.map((menuItem) =>
            menuItem.id === action.payload.id ? action.payload : menuItem
          );
        }
      )
      .addCase(
        updateMenuItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )
      .addCase(deleteMenuItem.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        deleteMenuItem.fulfilled,
        (state, action: PayloadAction<MenuItem>) => {
          handleFulfilledState(state, action);
          state.menuItems = state.menuItems.filter(
            (menuItem) => menuItem.id !== action.payload.id
          );
        }
      )
      .addCase(
        deleteMenuItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      );
  },
});

export default menuItemsSlice.reducer;
