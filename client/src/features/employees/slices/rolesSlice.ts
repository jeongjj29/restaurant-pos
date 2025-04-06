import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Role, RolesState } from "@employees/types";
import {
  handlePendingState,
  handleFulfilledState,
  handleRejectedState,
} from "@utils/sliceUtils";

export const fetchRoles = createAsyncThunk<
  Role[],
  undefined,
  { rejectValue: string }
>("roles/fetchRoles", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/roles");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch roles"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const addRole = createAsyncThunk<Role, Role, { rejectValue: string }>(
  "roles/addRole",
  async (newRole, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/roles", newRole);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to add role"
        );
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const updateRole = createAsyncThunk<Role, Role, { rejectValue: string }>(
  "roles/updateRole",
  async (updatedRole, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/roles/${updatedRole.id}`,
        updatedRole
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to update role"
        );
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const deleteRole = createAsyncThunk<
  Role,
  number,
  { rejectValue: string }
>("roles/deleteRole", async (roleId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`/api/roles/${roleId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete role"
      );
    }
    return rejectWithValue("An unknown error occurred");
  }
});

const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        handleFulfilledState(state, action);
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        handleRejectedState(state, action);
      })
      .addCase(addRole.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(addRole.fulfilled, (state, action) => {
        handleFulfilledState(state, action);
        state.roles.push(action.payload);
      })
      .addCase(addRole.rejected, (state, action) => {
        handleRejectedState(state, action);
      })
      .addCase(updateRole.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        handleFulfilledState(state, action);
        state.roles = state.roles.map((role) =>
          role.id === action.payload.id ? action.payload : role
        );
      })
      .addCase(updateRole.rejected, (state, action) => {
        handleRejectedState(state, action);
      })
      .addCase(deleteRole.pending, (state) => {
        handlePendingState(state);
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        handleFulfilledState(state, action);
        state.roles = state.roles.filter(
          (role) => role.id !== action.payload.id
        );
      })
      .addCase(deleteRole.rejected, (state, action) => {
        handleRejectedState(state, action);
      });
  },
});

export default rolesSlice.reducer;
