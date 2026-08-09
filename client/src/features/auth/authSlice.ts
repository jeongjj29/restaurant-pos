import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { LoginPayload, AuthState } from "@auth/types";
import { Employee } from "@employees/types";

const setAuthorizationHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setAuthorizationHeader(null);
};

const readStoredUser = (): Employee | null => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as Employee;
  } catch {
    clearStoredAuth();
    return null;
  }
};

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
    setAuthorizationHeader(access_token);
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
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await axios.post(
          "/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Server session could not be revoked; you were signed out locally"
        );
      }
      return rejectWithValue(
        "Server session could not be revoked; you were signed out locally"
      );
    } finally {
      clearStoredAuth();
    }
  }
);

const tokenFromStorage = localStorage.getItem("token");
const userFromStorage = readStoredUser();

setAuthorizationHeader(userFromStorage ? tokenFromStorage : null);

const initialState: AuthState = {
  isAuthenticated: Boolean(tokenFromStorage && userFromStorage),
  token: userFromStorage ? tokenFromStorage : null,
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
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error =
          action.payload ||
          "Server session could not be revoked; you were signed out locally";
      });
  },
});

export default authSlice.reducer;
