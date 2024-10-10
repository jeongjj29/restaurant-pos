import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "./employeesSlice";
import { toTitleCase } from "../../helpers";

function EmployeeTable() {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employees.employees);
  const loading = useSelector((state) => state.employees.loading);
  const error = useSelector((state) => state.employees.error);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  console.log(employees);

  return (
    <table>
      <tr>
        <th>Role</th>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email</th>
        <th>Username</th>
      </tr>
      {employees.map((employee) => (
        <tr key={employee.id}>
          <td>{toTitleCase(employee.role.name)}</td>
          <td>{employee.first_name}</td>
          <td>{employee.last_name}</td>
          <td>{employee.email}</td>
          <td>{employee.username}</td>
        </tr>
      ))}
    </table>
  );
}

export default EmployeeTable;
