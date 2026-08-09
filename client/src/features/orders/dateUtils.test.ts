import { describe, expect, it } from "vitest";
import { parseLocalDateInput } from "./dateUtils";

describe("parseLocalDateInput", () => {
  it("constructs a date at local midnight instead of parsing as UTC", () => {
    const result = parseLocalDateInput("2026-08-09");

    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(7);
    expect(result?.getDate()).toBe(9);
    expect(result?.getHours()).toBe(0);
  });

  it("rejects impossible or incomplete dates", () => {
    expect(parseLocalDateInput("2026-02-30")).toBeNull();
    expect(parseLocalDateInput("")).toBeNull();
  });
});
