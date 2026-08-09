import { describe, expect, it } from "vitest";

import apiClient from "./apiClient";

describe("API client", () => {
  it("uses credentialed same-origin requests with double-submit CSRF headers", () => {
    expect(apiClient.defaults.baseURL).toBeUndefined();
    expect(apiClient.defaults.withCredentials).toBe(true);
    expect(apiClient.defaults.withXSRFToken).toBeUndefined();
    expect(apiClient.defaults.xsrfCookieName).toBe("csrf_access_token");
    expect(apiClient.defaults.xsrfHeaderName).toBe("X-CSRF-TOKEN");
    expect(apiClient.defaults.headers.common["X-Requested-With"]).toBe(
      "XMLHttpRequest"
    );
  });
});
