import { Employee } from "@employees/types";

export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  user: Employee | null;
  loading: boolean;
  error: string | null;
};
