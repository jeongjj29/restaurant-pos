import { Employee } from "@employees/types";

export const MANAGER_ACCESS_LEVEL = 4;
export const ADMIN_ACCESS_LEVEL = 5;

export const hasMinimumAccess = (
  user: Employee | null,
  minimumAccessLevel: number
) => (user?.role.access_level ?? 0) >= minimumAccessLevel;
