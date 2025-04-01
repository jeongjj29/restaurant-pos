import { useEffect, useState } from "react";
import { DndContext, DragOverlay, DragEndEvent } from "@dnd-kit/core";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@app/hooks";
import { fetchTables, updateTable } from "@tables/slices/tablesSlice";
import DndMonitor from "@tables/DndMonitor";
import TableLayout from "@tables/components/TableLayout";
import TableList from "@tables/components/TableList";
import { RootState } from "@app/store";
import { Table } from "@tables/types";

function TableManagementPage() {
  const dispatch = useAppDispatch();

  const tables = useSelector((state: RootState) => state.tables.tables);
  const error = useSelector((state: RootState) => state.tables.error);

  const [activeTable, setActiveTable] = useState<Table | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const [overX, overY] = over.id.toString().split("-").map(Number);

    const occupiedLocation = tables.find(
      (table) => table.location_x === overX && table.location_y === overY
    );

    if (occupiedLocation) {
      dispatch(
        updateTable({
          tableId: occupiedLocation.id,
          updatedData: { location_x: null, location_y: null },
        })
      ).catch((err) => console.error("Error updating occupied table:", err));
    }

    dispatch(
      updateTable({
        tableId: parseInt(active.id.toString()),
        updatedData: { location_x: overX, location_y: overY },
      })
    ).catch((err) => console.error("Error updating dragged table:", err));
  };

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DndMonitor setActiveTable={setActiveTable} tables={tables} />

      <div className="w-full h-full flex gap-4 rounded-md overflow-visible">
        <TableLayout tables={tables} />
        <TableList tables={tables} />
      </div>

      <DragOverlay>
        {activeTable && (
          <div className="text-lg font-semibold flex flex-col justify-center items-center rounded-md px-2 py-4 bg-white/10 shadow-lg">
            <p>Table: {activeTable.number}</p>
            <p>Seats: {activeTable.capacity}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default TableManagementPage;
