import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchEmployees } from "../slices/employeesSlice";
import Employee from "./Employee";
import { Employee as EmployeeType } from "@employees/types";
import { RootState } from "@app/store";

interface EmployeeTableProps {
  setSelectedEmployee: (employee: EmployeeType) => void;
}

function EmployeeTable({ setSelectedEmployee }: EmployeeTableProps) {
  const dispatch = useAppDispatch();
  const employees = useAppSelector(
    (state: RootState) => state.employees.employees
  );
  const loading = useAppSelector((state: RootState) => state.employees.loading);
  const error = useAppSelector((state: RootState) => state.employees.error);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {employees.map((employee) => (
        <Employee
          key={employee.id}
          employee={employee}
          setSelectedEmployee={setSelectedEmployee}
        />
      ))}
    </div>
  );
}

export default EmployeeTable;
