import React, { useState } from "react";
import EmployeeTable from "../../features/employees/EmployeesTable";
import EmployeeForm from "../../features/employees/EmployeeForm";

function EmployeeManagementPage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formHidden, setFormHidden] = useState(true);

  return (
    <div className="flex flex-row">
      <div className="w-full">
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
      </div>
      <div>
        {(selectedEmployee || !formHidden) && (
          <EmployeeForm
            employee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            setFormHidden={setFormHidden}
          />
        )}
      </div>
    </div>
  );
}

export default EmployeeManagementPage;
