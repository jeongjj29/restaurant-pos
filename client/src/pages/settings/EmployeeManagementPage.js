import React, { useState } from "react";
import EmployeeTable from "../../features/employees/EmployeesTable";
import EmployeeForm from "../../features/employees/EmployeeForm";

function EmployeeManagementPage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  return (
    <div>
      <h1>Employees</h1>
      <EmployeeTable setSelectedEmployee={setSelectedEmployee} />

      {selectedEmployee && <EmployeeForm employee={selectedEmployee} />}
    </div>
  );
}

export default EmployeeManagementPage;
