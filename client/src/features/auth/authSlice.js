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
      localStorage.setItem("user", JSON.stringify(user)); // Store user data
      return { token: access_token, user }; // Return both token and user data
    } catch (error) {
      return rejectWithValue(error.response.data); // Pass error message to rejected case
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Make a POST request to the logout route
      // await axios.post("/logout", {});

      // Clear token from localStorage after successful logout
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // Clear user data
    } catch (error) {
      console.error("Logout error:", error);
      return rejectWithValue(error.response.data);
    }
  }
);

const tokenFromStorage = localStorage.getItem("token");
const userFromStorage = JSON.parse(localStorage.getItem("user"));

const initialState = {
  isAuthenticated: !!tokenFromStorage,
  token: tokenFromStorage || null,
  user: userFromStorage || null, // Initialize user data from localStorage
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
