import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import LoginPage from "./LoginPage";
import authReducer from "./authSlice";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const renderLoginPage = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>
  );
};

describe("LoginPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockedAxios.post.mockReset();
    localStorage.clear();
  });

  it("shows validation errors when fields are empty", async () => {
    renderLoginPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Username is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
  });

  it("logs in successfully and redirects to home", async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: "token-123",
        user: {
          id: 1,
          username: "manager01",
          first_name: "Alice",
          last_name: "Smith",
          email: "alice@example.com",
          phone_number: 1234567890,
          role_id: 1,
          created_at: "2026-02-20T00:00:00.000Z",
          role: { id: 1, name: "Admin", access_level: 5 },
        },
      },
    });

    renderLoginPage();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Enter your username"), "manager01");
    await user.type(screen.getByPlaceholderText("Enter your password"), "secure-password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
    expect(localStorage.getItem("token")).toBe("token-123");
  });

  it("shows login error on invalid credentials", async () => {
    mockedAxios.post.mockRejectedValue({
      response: {
        data: { message: "Invalid credentials" },
      },
    });

    renderLoginPage();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Enter your username"), "wrong");
    await user.type(screen.getByPlaceholderText("Enter your password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("Invalid username or password")
    ).toBeInTheDocument();
  });
});
