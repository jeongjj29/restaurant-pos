import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchEmployees } from "../slices/employeesSlice";
import { Employee as EmployeeType } from "@employees/types";
import { RootState } from "@app/store";
import { toTitleCase } from "@utils/stringUtils";
import CreateButton from "@components/buttons/CreateButton";
import EditButton from "@components/buttons/EditButton";

interface EmployeeTableProps {
  setSelectedEmployee: (employee: EmployeeType | null) => void;
  setFormHidden: (hidden: boolean) => void;
}

function EmployeeTable({
  setSelectedEmployee,
  setFormHidden,
}: EmployeeTableProps) {
  const dispatch = useAppDispatch();
  const employees = useAppSelector(
    (state: RootState) => state.employees.employees
  );
  const loading = useAppSelector((state: RootState) => state.employees.loading);
  const error = useAppSelector((state: RootState) => state.employees.error);

  if (loading && employees.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border border-border bg-white/5 text-text-secondary">
        Loading employees…
      </div>
    );
  }

  if (error && employees.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-error/40 bg-error/10 p-6 text-center">
        <p className="text-error">Could not load employees: {error}</p>
        <button
          type="button"
          onClick={() => void dispatch(fetchEmployees())}
          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-white/10"
        >
          Try again
        </button>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-white/5 p-6 text-center">
        <p className="text-text-secondary">No employees have been added yet.</p>
        <button
          type="button"
          onClick={() => {
            setSelectedEmployee(null);
            setFormHidden(false);
          }}
          className="accent-badge rounded-lg px-4 py-2 text-sm"
        >
          Add first employee
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-0 w-full overflow-auto rounded-xl border border-border bg-black/10">
      <table className="min-w-full bg-surface text-text-primary overflow-hidden rounded-md">
        <thead className="bg-white/5 text-text-primary">
          <tr>
            <th className="py-3 px-6 text-left text-md font-semibold">
              First Name
            </th>
            <th className="py-3 px-6 text-left text-md font-semibold">
              Last Name
            </th>
            <th className="py-3 px-6 text-left text-md font-semibold">Role</th>
            <th className="py-3 px-6 text-left text-md font-semibold">
              Phone #
            </th>
            <th className="py-3 px-6 text-left text-md font-semibold">Email</th>
            <th className="py-3 px-6 text-left text-md font-semibold">
              <CreateButton
                onClick={() => {
                  setSelectedEmployee(null);
                  setFormHidden(false);
                }}
              />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {employees.map((employee, index) => (
            <tr
              key={employee.id}
              className={`${
                index % 2 === 0 ? "bg-white/10" : "bg-white/5"
              } hover:bg-surface/60 cursor-pointer transition-colors`}
            >
              <td className="py-3 px-6 text-left">{employee.first_name}</td>
              <td className="py-3 px-6 text-left">{employee.last_name}</td>
              <td className="py-3 px-6 text-left">
                {toTitleCase(employee.role.name)}
              </td>
              <td className="py-3 px-6 text-left">{employee.phone_number}</td>
              <td className="py-3 px-6 text-left">{employee.email}</td>
              <td className="py-3 px-6 text-left">
                <EditButton
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setFormHidden(false);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;
