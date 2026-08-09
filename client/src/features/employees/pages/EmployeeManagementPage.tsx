import { useState } from "react";
import EmployeeTable from "@employees/components/EmployeesTable";
import EmployeeForm from "@employees/components/EmployeeForm";
import { Employee } from "@employees/types";
import { useAppSelector } from "@app/hooks";
import { ADMIN_ACCESS_LEVEL, hasMinimumAccess } from "@auth/access";

function EmployeeManagementPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const canEditEmployees = hasMinimumAccess(currentUser, ADMIN_ACCESS_LEVEL);
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
          canEdit={canEditEmployees}
        />
        <div className="min-h-0 overflow-auto">
          {canEditEmployees && !formHidden ? (
            <EmployeeForm
              employee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
              setFormHidden={setFormHidden}
            />
          ) : canEditEmployees ? (
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-white/5 p-6 text-center text-sm text-text-secondary">
              Select an employee to edit, or create a new team member.
            </div>
          ) : (
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-border bg-white/5 p-6 text-center text-sm text-text-secondary">
              Employee profiles are read-only for managers. An administrator can
              create or update staff accounts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeManagementPage;
