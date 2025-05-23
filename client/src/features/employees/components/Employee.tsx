import { toTitleCase } from "@utils/stringUtils";
import { Employee as EmployeeType } from "@employees/types";

interface EmployeeProps {
  employee: EmployeeType;
  setSelectedEmployee: (employee: EmployeeType) => void;
}

function Employee({ employee, setSelectedEmployee }: EmployeeProps) {
  return (
    <div className="w-1/3 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md mb-4 hover:bg-gray-50 transition duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <div>
          <h2 className="text-lg font-semibold">
            {employee.first_name} {employee.last_name}
          </h2>
          <h3 className="text-gray-500">{toTitleCase(employee.role.name)}</h3>
        </div>

        <div className="sm:border-l sm:pl-4 sm:ml-4">
          <p className="text-gray-600">{employee.email}</p>
          <p className="text-gray-600">{employee.username}</p>
        </div>
      </div>

      <div className="flex space-x-2 mt-4 sm:mt-0">
        <button
          onClick={() => setSelectedEmployee(employee)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-hidden"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default Employee;
