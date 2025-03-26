import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteTable } from "./tablesSlice";
import TableForm from "./TableForm";
import DraggableTable from "./DraggableTable";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function TableList({ tables }) {
  const dispatch = useDispatch();
  const [editFormHidden, setEditFormHidden] = useState(true);
  const [tableToEdit, setTableToEdit] = useState(null);
  const sortedTables = [...tables].sort((a, b) => a.number - b.number);

  return (
    <div className="h-full p-4 px-8 rounded-md shadow-lg bg-white/5">
      {/* Add New Table Button */}
      {editFormHidden && (
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
      <div className="flex flex-col flex-wrap gap-4 max-h-full">
        {sortedTables.map((table) => (
          <div
            key={table.id}
            className="bg-white/5 h-fit p-2 rounded-md shadow-md flex items-center"
          >
            {/* Table Information */}
            <DraggableTable
              tableId={table.id}
              number={table.number}
              capacity={table.capacity}
            />

            {/* Edit and Delete Buttons */}
            <div className="flex flex-col gap-2">
              <button
                className="bg-green-800 hover:bg-green-800 text-white font-bold py-2 px-2 rounded"
                onClick={() => {
                  setEditFormHidden(false);
                  setTableToEdit(table);
                }}
              >
                <EditIcon />
              </button>

              <button
                className="bg-red-800 hover:bg-red-800 text-white font-bold py-2 px-2 rounded"
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
                <DeleteIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableList;
