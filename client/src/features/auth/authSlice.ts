import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { LoginPayload, AuthState } from "@auth/types";
import { Employee } from "@employees/types";

export const login = createAsyncThunk<
  {
    token: string;
    user: Employee;
  },
  LoginPayload,
  { rejectValue: string }
>("auth/login", async ({ username, password }, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/auth/login", {
      username,
      password,
    });
    const { access_token, user } = response.data;
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));
    return { token: access_token, user };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
    return rejectWithValue("An unknown error occurred during login");
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error: unknown) {
      console.error("Logout error:", error);
      if (axios.isAxiosError(error)) {
        return rejectWithValue("Logout failed due to network issue");
      }
      return rejectWithValue("An unknown error occurred during logout");
    }
  }
);

const tokenFromStorage = localStorage.getItem("token");
const userFromStorage = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user")!)
  : null;

const initialState: AuthState = {
  isAuthenticated: !!tokenFromStorage,
  token: tokenFromStorage,
  user: userFromStorage,
  loading: false,
  error: null,
};

const setError = (
  state: AuthState,
  action: PayloadAction<string | undefined>
) => {
  state.loading = false;
  state.error = action.payload || "An error occurred";
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
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<{ token: string; user: Employee }>) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      )
      .addCase(login.rejected, setError)

      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(logout.rejected, setError);
  },
});

export default authSlice.reducer;
