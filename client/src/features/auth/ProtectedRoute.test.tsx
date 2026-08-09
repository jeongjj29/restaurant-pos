import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import axios from "axios";
import { Provider } from "react-redux";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import authReducer from "./authSlice";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const employee = {
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

function LoginDestination() {
  const location = useLocation();
  return <p>Login destination: {(location.state as { from?: string })?.from}</p>;
}

const renderProtectedRoute = () => {
  const store = configureStore({ reducer: { auth: authReducer } });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/orders/all?status=open"]}>
        <Routes>
          <Route
            path="/orders/all"
            element={
              <ProtectedRoute>
                <p>Protected orders</p>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginDestination />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.isAxiosError.mockReturnValue(true);
  });

  it("restores a cookie session before showing protected content", async () => {
    mockedAxios.get.mockResolvedValue({ data: { user: employee } });

    renderProtectedRoute();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Restoring your session"
    );
    expect(await screen.findByText("Protected orders")).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("redirects unauthenticated users and preserves the internal return path", async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 401, data: { message: "Missing cookie" } },
    });

    renderProtectedRoute();

    expect(
      await screen.findByText("Login destination: /orders/all?status=open")
    ).toBeInTheDocument();
  });
});
