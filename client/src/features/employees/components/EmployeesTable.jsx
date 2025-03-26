import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "./employeesSlice";
import Employee from "./Employee";

function EmployeeTable({ setSelectedEmployee }) {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employees.employees);
  const loading = useSelector((state) => state.employees.loading);
  const error = useSelector((state) => state.employees.error);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {employees.map((employee) => {
        return (
          <Employee
            key={employee.id}
            employee={employee}
            setSelectedEmployee={setSelectedEmployee}
          />
        );
      })}
    </div>
  );
}

export default EmployeeTable;
