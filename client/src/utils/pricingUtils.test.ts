import { describe, expect, it } from "vitest";

import { calculateOrderPreview } from "./pricingUtils";

describe("calculateOrderPreview", () => {
  it("uses the runtime rate and rounds the total to currency precision", () => {
    expect(calculateOrderPreview(19.99, 0.0725)).toEqual({
      tax: 1.45,
      total: 21.44,
    });
  });
});
