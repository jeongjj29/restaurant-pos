import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for logging in
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/login", { username, password });
      const { access_token, user } = response.data; // Assuming you also get user data

      localStorage.setItem("token", access_token);
      return { token: access_token, user }; // Return both token and user data
    } catch (error) {
      return rejectWithValue(error.response.data); // Pass error message to rejected case
    }
  }
);

const tokenFromStorage = localStorage.getItem("token");

const initialState = {
  isAuthenticated: !!tokenFromStorage,
  token: tokenFromStorage || null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.loading = false;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;

      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null; // Reset error on new login attempt
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token; // Token from login response
        state.user = action.payload.user; // User data from login response
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Error message from the API
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
