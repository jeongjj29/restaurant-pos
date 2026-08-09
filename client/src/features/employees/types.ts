export interface Role {
  id: number;
  name: string;
  access_level: number;
}

export interface RolesState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

export interface Employee {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  role_id: number;
  created_at: string | Date;
  role: Role;
}

export interface EmployeesState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}

export interface AddEmployeePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  username: string;
  role_id: number;
  password: string;
}

export type UpdateEmployeePayload = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  username: string;
  role_id: number;
};
