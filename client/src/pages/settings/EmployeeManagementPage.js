import React, { useState } from "react";
import EmployeeTable from "../../features/employees/EmployeesTable";
import EmployeeForm from "../../features/employees/EmployeeForm";

function EmployeeManagementPage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formHidden, setFormHidden] = useState(true);

  return (
    <div>
      <h1>Employees</h1>
      <button
        onClick={() => {
          setSelectedEmployee(null);
          setFormHidden(false);
        }}
      >
        Add Employee
      </button>
      <EmployeeTable setSelectedEmployee={setSelectedEmployee} />

      {(selectedEmployee || !formHidden) && (
        <EmployeeForm
          employee={selectedEmployee}
          setFormHidden={setFormHidden}
        />
      )}
    </div>
  );
}

export default EmployeeManagementPage;
