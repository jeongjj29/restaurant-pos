import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import runtimeConfigReducer, { fetchRuntimeConfig } from "./runtimeConfigSlice";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const createStore = () =>
  configureStore({ reducer: { runtimeConfig: runtimeConfigReducer } });

describe("runtime configuration", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.isAxiosError.mockReturnValue(true);
  });

  it("loads the authenticated server sales tax rate", async () => {
    mockedAxios.get.mockResolvedValue({ data: { sales_tax_rate: 0.0725 } });
    const store = createStore();

    await expect(store.dispatch(fetchRuntimeConfig()).unwrap()).resolves.toBe(
      0.0725
    );

    expect(mockedAxios.get).toHaveBeenCalledWith("/api/config");
    expect(store.getState().runtimeConfig).toMatchObject({
      salesTaxRate: 0.0725,
      loading: false,
      error: null,
    });
  });

  it("rejects an invalid rate instead of calculating misleading totals", async () => {
    mockedAxios.get.mockResolvedValue({ data: { sales_tax_rate: 1.5 } });
    const store = createStore();

    await expect(store.dispatch(fetchRuntimeConfig()).unwrap()).rejects.toBe(
      "Server returned an invalid sales tax rate"
    );

    expect(store.getState().runtimeConfig).toMatchObject({
      salesTaxRate: null,
      error: "Server returned an invalid sales tax rate",
    });
  });
});
