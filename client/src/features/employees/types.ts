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
  role_id: number;
  created_at: Date;
  updated_at: Date;
  role: Role;
}

export interface EmployeesState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}
