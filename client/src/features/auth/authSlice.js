import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const tokenFromStorage = localStorage.getItem("token");

export const login = async (username, password) => {
  try {
    const response = await axios.post("/login", { username, password });
    const { access_token } = response.data;

    localStorage.setItem("token", access_token);
    return access_token;
  } catch (error) {
    return error.response.data;
  }
};

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
      });
  },
});

export const { loginStart, logout } = authSlice.actions;

export default authSlice.reducer;
