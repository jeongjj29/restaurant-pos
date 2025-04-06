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
    <div className="h-full flex bg-white/5 rounded-md p-4">
      <EmployeeTable
        setSelectedEmployee={setSelectedEmployee}
        setFormHidden={setFormHidden}
      />
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
