import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMenuCategories = createAsyncThunk(
  "menuCategories/fetchMenuCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/menu_categories");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addMenuCategory = createAsyncThunk(
  "menuCategories/addMenuCategory",
  async (menuCategoryData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/menu_categories", menuCategoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateMenuCategory = createAsyncThunk(
  "menuCategories/updateMenuCategory",
  async (menuCategoryData, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `/menu_categories/${menuCategoryData.id}`,
        menuCategoryData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  menuCategories: [],
  loading: false,
  error: null,
};

const menuCategoriesSlice = createSlice({
  name: "menuCategories",
  initialState,
  reducers: {
    setMenuCategories: (state, action) => {
      state.menuCategories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMenuCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.menuCategories = action.payload;
      })
      .addCase(fetchMenuCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addMenuCategory.fulfilled, (state, action) => {
        state.menuCategories.push(action.payload);
      })
      .addCase(addMenuCategory.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateMenuCategory.fulfilled, (state, action) => {
        const index = state.menuCategories.findIndex(
          (menuCategory) => menuCategory.id === action.payload.id
        );
        if (index !== -1) {
          state.menuCategories[index] = action.payload;
        }
      })
      .addCase(updateMenuCategory.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default menuCategoriesSlice.reducer;
