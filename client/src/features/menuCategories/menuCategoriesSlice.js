import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { addMenuItem, setMenuItems } from "../menuItems/menuItemsSlice";
import { setLoading } from "../employees/employeesSlice";

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
    addMenuCategory: (state, action) => {
      state.menuCategories.push(action.payload);
    },
    updateMenuCategory: (state, action) => {
      const index = state.menuCategories.findIndex(
        (menuCategory) => menuCategory.id === action.payload.id
      );
      if (index !== -1) {
        state.menuCategories[index] = action.payload;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
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
      });
  },
});

export const {
  setMenuCategories,
  addMenuCategory,
  updateMenuCategory,
  setLoading,
  setError,
} = menuCategoriesSlice.actions;
export default menuCategoriesSlice.reducer;
