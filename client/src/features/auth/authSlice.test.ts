import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import authReducer, {
  login,
  logout,
  restoreSession,
  sessionExpired,
} from "./authSlice";
import { Employee } from "@employees/types";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const employee: Employee = {
  id: 1,
  username: "admin",
  first_name: "Admin",
  last_name: "User",
  email: "admin@example.com",
  phone_number: "2125550100",
  role_id: 1,
  created_at: "2026-01-01T00:00:00Z",
  role: { id: 1, name: "Admin", access_level: 5 },
};

const createStore = () => configureStore({ reducer: { auth: authReducer } });

const authenticatedStore = () => {
  const store = createStore();
  store.dispatch(
    login.fulfilled(employee, "login-request", {
      username: "admin",
      password: "password",
    })
  );
  return store;
};

describe("cookie-backed authentication", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
    mockedAxios.isAxiosError.mockReturnValue(true);
    localStorage.clear();
  });

  it("restores the current user from the server session", async () => {
    mockedAxios.get.mockResolvedValue({ data: { user: employee } });
    const store = createStore();

    await store.dispatch(restoreSession()).unwrap();

    expect(mockedAxios.get).toHaveBeenCalledWith("/api/auth/me");
    expect(store.getState().auth).toMatchObject({
      initialized: true,
      isAuthenticated: true,
      user: employee,
    });
  });

  it("finishes initialization without exposing a failed session as an error", async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 401, data: { message: "Missing cookie" } },
    });
    const store = createStore();

    await expect(store.dispatch(restoreSession()).unwrap()).rejects.toBe(
      "Missing cookie"
    );

    expect(store.getState().auth).toMatchObject({
      initialized: true,
      isAuthenticated: false,
      user: null,
      error: null,
    });
  });

  it("logs out through the credentialed cookie endpoint", async () => {
    mockedAxios.post.mockResolvedValue({ data: { message: "ok" } });
    const store = authenticatedStore();

    await store.dispatch(logout()).unwrap();

    expect(mockedAxios.post).toHaveBeenCalledWith("/api/auth/logout");
    expect(localStorage.getItem("token")).toBeNull();
    expect(store.getState().auth).toMatchObject({
      initialized: true,
      isAuthenticated: false,
      user: null,
    });
  });

  it("still clears client authentication when server revocation fails", async () => {
    mockedAxios.post.mockRejectedValue({
      response: { data: { message: "Session expired" } },
    });
    const store = authenticatedStore();

    await expect(store.dispatch(logout()).unwrap()).rejects.toBe(
      "Session expired"
    );

    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.error).toBe("Session expired");
  });

  it("clears an expired session reported by the API client", () => {
    const store = authenticatedStore();

    store.dispatch(sessionExpired());

    expect(store.getState().auth).toMatchObject({
      initialized: true,
      isAuthenticated: false,
      user: null,
      error: "Your session expired. Sign in again to continue.",
    });
  });
});
