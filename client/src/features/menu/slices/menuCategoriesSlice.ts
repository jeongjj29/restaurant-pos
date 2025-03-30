import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MenuCategory, MenuCategoriesState } from "@menu/types";
import {
  handlePendingState,
  handleFulfilledState,
  handleRejectedState,
} from "@utils/sliceUtils";

export const fetchMenuCategories = createAsyncThunk<
  MenuCategory[],
  undefined,
  { rejectValue: string }
>("menuCategories/fetchMenuCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/menuCategories");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch menu categories"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const addMenuCategory = createAsyncThunk<
  MenuCategory,
  MenuCategory,
  { rejectValue: string }
>(
  "menuCategories/addMenuCategory",
  async (newMenuCategory, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/menuCategories", newMenuCategory);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to add menu category"
        );
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const updateMenuCategory = createAsyncThunk<
  MenuCategory,
  MenuCategory,
  { rejectValue: string }
>(
  "menuCategories/updateMenuCategory",
  async (updatedMenuCategory, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/menuCategories/${updatedMenuCategory.id}`,
        updatedMenuCategory
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to update menu category"
        );
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const deleteMenuCategory = createAsyncThunk<
  MenuCategory,
  number,
  { rejectValue: string }
>(
  "menuCategories/deleteMenuCategory",
  async (menuCategoryId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `/api/menuCategories/${menuCategoryId}`
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to delete menu category"
        );
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

const initialState: MenuCategoriesState = {
  menuCategories: [],
  loading: false,
  error: null,
};

const menuCategoriesSlice = createSlice({
  name: "menuCategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuCategories.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        fetchMenuCategories.fulfilled,
        (state, action: PayloadAction<MenuCategory[]>) => {
          handleFulfilledState(state, action);
          state.menuCategories = action.payload;
        }
      )
      .addCase(
        fetchMenuCategories.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )
      .addCase(addMenuCategory.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        addMenuCategory.fulfilled,
        (state, action: PayloadAction<MenuCategory>) => {
          handleFulfilledState(state, action);
          state.menuCategories.push(action.payload);
        }
      )
      .addCase(
        addMenuCategory.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )
      .addCase(updateMenuCategory.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        updateMenuCategory.fulfilled,
        (state, action: PayloadAction<MenuCategory>) => {
          handleFulfilledState(state, action);
          state.menuCategories = state.menuCategories.map((category) =>
            category.id === action.payload.id ? action.payload : category
          );
        }
      )
      .addCase(
        updateMenuCategory.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      )
      .addCase(deleteMenuCategory.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(
        deleteMenuCategory.fulfilled,
        (state, action: PayloadAction<MenuCategory>) => {
          handleFulfilledState(state, action);
          state.menuCategories = state.menuCategories.filter(
            (category) => category.id !== action.payload.id
          );
        }
      )
      .addCase(
        deleteMenuCategory.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          handleRejectedState(state, action);
        }
      );
  },
});
