import { Employee } from "@employees/types";

export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  user: Employee | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
};

export type LoginFormValues = {
  username: string;
  password: string;
};
