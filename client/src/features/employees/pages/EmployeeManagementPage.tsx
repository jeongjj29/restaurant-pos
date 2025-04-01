import { useState } from "react";
import EmployeeTable from "@employees/components/EmployeesTable";
import EmployeeForm from "@employees/components/EmployeeForm";
import { Employee } from "@employees/types";

function EmployeeManagementPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [formHidden, setFormHidden] = useState<boolean>(true);

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
