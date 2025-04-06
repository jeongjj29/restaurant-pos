import { PayloadAction } from "@reduxjs/toolkit";

export const handlePendingState = (state: {
  loading: boolean;
  error: string | null;
}) => {
  state.loading = true;
  state.error = null;
};

export const handleFulfilledState = <T>(
  state: { loading: boolean; error: string | null },
  action: PayloadAction<T>
) => {
  state.loading = false;
  state.error = null;
};

export const handleRejectedState = (
  state: { loading: boolean; error: string | null },
  action: PayloadAction<string | undefined>
) => {
  state.loading = false;
  state.error = action.payload ?? "An unknown error occurred";
};
