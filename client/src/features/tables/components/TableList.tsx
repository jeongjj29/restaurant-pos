import { useState } from "react";
import { useAppDispatch } from "@app/hooks";
import { deleteTable } from "../slices/tablesSlice";
import TableForm from "./TableForm";
import DraggableTable from "./DraggableTable";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Table } from "@tables/types";

interface TableListProps {
  tables: Table[];
}

function TableList({ tables }: TableListProps) {
  const dispatch = useAppDispatch();
  const [editFormHidden, setEditFormHidden] = useState(true);
  const [tableToEdit, setTableToEdit] = useState<Table | null>(null);

  const sortedTables = [...tables].sort((a, b) => a.number - b.number);

  return (
    <div className="h-full p-4 px-8 rounded-md shadow-lg bg-white/5">
      {editFormHidden && (
        <button
          className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-sm mb-4"
          onClick={() => {
            setEditFormHidden(false);
            setTableToEdit(null);
          }}
        >
          Add New Table
        </button>
      )}

      {!editFormHidden && (
        <div className="flex h-full items-center justify-center">
          <TableForm
            tableToEdit={tableToEdit}
            setEditFormHidden={setEditFormHidden}
            setTableToEdit={setTableToEdit}
            tables={tables}
          />
        </div>
      )}

      {editFormHidden && (
        <div className="flex flex-col flex-wrap gap-4 max-h-full">
          {sortedTables.map((table) => (
            <div
              key={table.id}
              className="bg-white/5 h-fit p-2 rounded-md shadow-md flex items-center"
            >
              <DraggableTable
                tableId={table.id}
                number={table.number}
                capacity={table.capacity}
              />

              <div className="flex flex-col gap-2">
                <button
                  className="bg-green-800 hover:bg-green-800 text-white font-bold py-2 px-2 rounded-sm"
                  onClick={() => {
                    setEditFormHidden(false);
                    setTableToEdit(table);
                  }}
                >
                  <EditIcon />
                </button>

                <button
                  className="bg-red-800 hover:bg-red-800 text-white font-bold py-2 px-2 rounded-sm"
                  onClick={() => {
                    dispatch(deleteTable(table.id))
                      .unwrap()
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
      )}
    </div>
  );
}

export default TableList;
