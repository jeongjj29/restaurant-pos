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
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
          Staff directory
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Employees</h1>
      </div>
      <div className="grid h-[calc(100%-4.5rem)] min-h-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <EmployeeTable
          setSelectedEmployee={setSelectedEmployee}
          setFormHidden={setFormHidden}
        />
        <div className="min-h-0 overflow-auto">
          {!formHidden ? (
            <EmployeeForm
              employee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
              setFormHidden={setFormHidden}
            />
          ) : (
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-white/5 p-6 text-center text-sm text-text-secondary">
              Select an employee to edit, or create a new team member.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeManagementPage;
