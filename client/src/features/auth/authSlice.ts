import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@app/apiClient";
import { LoginPayload, AuthState } from "@auth/types";
import { Employee } from "@employees/types";

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || fallback
    : fallback;

export const restoreSession = createAsyncThunk<
  Employee,
  void,
  { rejectValue: string }
>("auth/restoreSession", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<{ user: Employee }>("/api/auth/me");
    return response.data.user;
  } catch (error: unknown) {
    return rejectWithValue(errorMessage(error, "No active session"));
  }
});

export const login = createAsyncThunk<
  Employee,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async ({ username, password }, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/auth/login", {
      username,
      password,
    });
    return response.data.user;
  } catch (error: unknown) {
    return rejectWithValue(errorMessage(error, "Login failed"));
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error: unknown) {
      return rejectWithValue(
        errorMessage(
          error,
          "Server session could not be revoked; you were signed out locally"
        )
      );
    }
  }
);

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  initialized: false,
  loading: false,
  error: null,
};

const setError = (
  state: AuthState,
  action: PayloadAction<string | undefined>
) => {
  state.loading = false;
  state.initialized = true;
  state.error = action.payload || "An error occurred";
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionExpired: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.initialized = true;
      state.loading = false;
      state.error = "Your session expired. Sign in again to continue.";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, setError)

      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.error =
          action.payload ||
          "Server session could not be revoked; you were signed out locally";
      });
  },
});

export const { sessionExpired } = authSlice.actions;
export default authSlice.reducer;
