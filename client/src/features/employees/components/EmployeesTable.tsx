import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchEmployees } from "../slices/employeesSlice";
import Employee from "./Employee";
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

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="overflow-x-auto w-full m-4 ml-6">
      <table className="min-w-fit bg-surface text-text-primary overflow-hidden border border-border rounded-md">
        <thead className="bg-white/ texxt-text-primary">
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
