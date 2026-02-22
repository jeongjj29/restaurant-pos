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
    <div className="glass-panel h-full min-h-0 rounded-2xl p-3 md:p-4">
      <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <EmployeeTable
        setSelectedEmployee={setSelectedEmployee}
        setFormHidden={setFormHidden}
      />
      <div className="min-h-0 overflow-auto">
        {(selectedEmployee || !formHidden) && (
          <EmployeeForm
            employee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            setFormHidden={setFormHidden}
          />
        )}
      </div>
      </div>
    </div>
  );
}

export default EmployeeManagementPage;
