import { describe, expect, it } from "vitest";

import { sessionExpired } from "@auth/authSlice";
import type { Employee } from "@employees/types";
import { rootReducer } from "./store";

const employee: Employee = {
  id: 1,
  username: "admin",
  first_name: "Admin",
  last_name: "User",
  email: "admin@example.com",
  phone_number: "2125550100",
  role_id: 1,
  created_at: "2026-08-09T00:00:00Z",
  role: { id: 1, name: "Admin", access_level: 5 },
};

describe("root reducer session cleanup", () => {
  it("clears cached domain and management data when the session expires", () => {
    const initialState = rootReducer(undefined, { type: "test/init" });
    const populatedState = {
      ...initialState,
      employees: {
        ...initialState.employees,
        employees: [employee],
      },
      roles: {
        ...initialState.roles,
        roles: [employee.role],
      },
      runtimeConfig: {
        ...initialState.runtimeConfig,
        salesTaxRate: 0.0725,
      },
    };

    const clearedState = rootReducer(populatedState, sessionExpired());

    expect(clearedState.employees.employees).toEqual([]);
    expect(clearedState.roles.roles).toEqual([]);
    expect(clearedState.runtimeConfig.salesTaxRate).toBeNull();
    expect(clearedState.auth).toMatchObject({
      initialized: true,
      isAuthenticated: false,
      user: null,
      error: "Your session expired. Sign in again to continue.",
    });
  });
});
