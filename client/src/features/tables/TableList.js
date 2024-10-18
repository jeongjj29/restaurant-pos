import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteTable } from "./tablesSlice";
import TableForm from "./TableForm";
import DraggableTable from "./DraggableTable";

function TableList({ tables, onTableClick, selectedSpot, setSelectedSpot }) {
  const dispatch = useDispatch();
  const [editFormHidden, setEditFormHidden] = useState(true);
  const [tableToEdit, setTableToEdit] = useState(null);
  const sortedTables = [...tables].sort((a, b) => a.number - b.number);

  return (
    <div className="w-160 h-screen overflow-y-auto bg-white p-4 shadow-lg p-6 bg-gray-100 rounded-md shadow-lg">
      {/* Cancel Table Selection Button */}
      {selectedSpot && (
        <button
          onClick={() => setSelectedSpot(null)}
          className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Cancel Table Selection
        </button>
      )}

      {/* Add New Table Button */}
      {editFormHidden && !selectedSpot && (
        <button
          className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={() => {
            setEditFormHidden(false);
            setTableToEdit(null);
          }}
        >
          Add New Table
        </button>
      )}

      {/* Form Section for Add/Edit */}
      {!editFormHidden && (
        <TableForm
          tableToEdit={tableToEdit}
          setEditFormHidden={setEditFormHidden}
          setTableToEdit={setTableToEdit}
          tables={tables}
        />
      )}

      {/* Table List */}
      <ul className="list-none space-y-4">
        {sortedTables.map((table) => (
          <li
            key={table.id}
            className="bg-white p-4 rounded-md shadow-md flex justify-between items-center"
          >
            {/* Table Information */}
            <DraggableTable
              tableId={table.id}
              number={table.number}
              capacity={table.capacity}
            />

            {/* Select Table Button */}
            {selectedSpot && (
              <button
                className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                onClick={() => onTableClick(table.id)}
              >
                Select
              </button>
            )}

            {/* Edit and Delete Buttons */}
            <div className="flex gap-2">
              {!selectedSpot && (
                <button
                  className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    setEditFormHidden(false);
                    setTableToEdit(table);
                  }}
                >
                  Edit
                </button>
              )}
              {!selectedSpot && (
                <button
                  className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    dispatch(deleteTable(table.id)) // Pass just the table ID
                      .unwrap() // Unwrap the result to handle the actual promise
                      .then((res) => {
                        console.log("Table deleted successfully:", res);
                      })
                      .catch((err) => {
                        console.error("Error deleting table:", err);
                      });
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}

        {/* Remove Assignment Button */}
        {selectedSpot && selectedSpot.tableId && (
          <button
            className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mt-4"
            onClick={() => onTableClick(null)}
          >
            Remove
          </button>
        )}
      </ul>
    </div>
  );
}

export default TableList;
