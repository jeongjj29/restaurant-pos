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
    <div className="h-full min-h-0 rounded-xl border border-border bg-white/5 p-3">
      {editFormHidden && (
        <button
          className="mb-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#2a1703] hover:bg-accent-soft"
          onClick={() => {
            setEditFormHidden(false);
            setTableToEdit(null);
          }}
        >
          Add New Table
        </button>
      )}

      {!editFormHidden && (
        <div className="h-full overflow-auto">
          <TableForm
            tableToEdit={tableToEdit}
            setEditFormHidden={setEditFormHidden}
            setTableToEdit={setTableToEdit}
            tables={tables}
          />
        </div>
      )}

      {editFormHidden && (
        <div className="grid max-h-[calc(100%-3rem)] grid-cols-1 gap-3 overflow-auto pr-1">
          {sortedTables.map((table) => (
            <div
              key={table.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-black/10 p-2"
            >
              <DraggableTable
                tableId={table.id}
                number={table.number}
                capacity={table.capacity}
              />

              <div className="flex flex-col gap-2">
                <button
                  className="rounded-md bg-emerald-500/80 px-2 py-2 text-white hover:bg-emerald-400"
                  onClick={() => {
                    setEditFormHidden(false);
                    setTableToEdit(table);
                  }}
                >
                  <EditIcon />
                </button>

                <button
                  className="rounded-md bg-rose-500/80 px-2 py-2 text-white hover:bg-rose-400"
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
