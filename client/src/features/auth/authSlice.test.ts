import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import authReducer, { login, logout } from "./authSlice";
import { Employee } from "@employees/types";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const employee: Employee = {
  id: 1,
  username: "admin",
  first_name: "Admin",
  last_name: "User",
  email: "admin@example.com",
  phone_number: 2125550100,
  role_id: 1,
  created_at: "2026-01-01T00:00:00Z",
  role: { id: 1, name: "Admin", access_level: 5 },
};

const authenticatedStore = () => {
  const store = configureStore({ reducer: { auth: authReducer } });
  store.dispatch(
    login.fulfilled(
      { token: "token-123", user: employee },
      "login-request",
      { username: "admin", password: "password" }
    )
  );
  localStorage.setItem("token", "token-123");
  localStorage.setItem("user", JSON.stringify(employee));
  axios.defaults.headers.common.Authorization = "Bearer token-123";
  return store;
};

describe("auth logout", () => {
  beforeEach(() => {
    localStorage.clear();
    delete axios.defaults.headers.common.Authorization;
    mockedAxios.post.mockReset();
    mockedAxios.isAxiosError.mockReturnValue(true);
  });

  it("revokes the bearer token before clearing local authentication", async () => {
    mockedAxios.post.mockResolvedValue({ data: { message: "ok" } });
    const store = authenticatedStore();

    await store.dispatch(logout()).unwrap();

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/api/auth/logout",
      {},
      { headers: { Authorization: "Bearer token-123" } }
    );
    expect(localStorage.getItem("token")).toBeNull();
    expect(axios.defaults.headers.common.Authorization).toBeUndefined();
    expect(store.getState().auth).toMatchObject({
      isAuthenticated: false,
      token: null,
      user: null,
    });
  });

  it("still signs out locally when server revocation fails", async () => {
    mockedAxios.post.mockRejectedValue({
      response: { data: { message: "Token expired" } },
    });
    const store = authenticatedStore();

    await expect(store.dispatch(logout()).unwrap()).rejects.toBe("Token expired");

    expect(localStorage.getItem("token")).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.error).toBe("Token expired");
  });
});
