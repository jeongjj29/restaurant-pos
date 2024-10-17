import React from "react";

function Employee({ employee, setSelectedEmployee }) {
  return (
    <div className="w-1/3 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md mb-4 hover:bg-gray-50 transition duration-200">
      {/* Employee Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <div>
          <h2 className="text-lg font-semibold">
            {employee.first_name} {employee.last_name}
          </h2>
          <h3 className="text-gray-500">{employee.role.name}</h3>
        </div>

        <div className="sm:border-l sm:pl-4 sm:ml-4">
          <p className="text-gray-600">{employee.email}</p>
          <p className="text-gray-600">{employee.username}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-2 mt-4 sm:mt-0">
        <button
          onClick={() => {
            setSelectedEmployee(employee);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Edit
        </button>
        <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none">
          Hide
        </button>
      </div>
    </div>
  );
}

export default Employee;
