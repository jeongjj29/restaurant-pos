import React, { useState } from "react";
import EmployeeTable from "../../features/employees/EmployeesTable";

function EmployeeManagementPage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  return (
    <div>
      <h1>Employees</h1>
      <EmployeeTable setSelectedEmployee={setSelectedEmployee} />
    </div>
  );
}

export default EmployeeManagementPage;
