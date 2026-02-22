import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  pointerWithin,
} from "@dnd-kit/core";
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
        tableId: parseInt(active.id.toString(), 10),
        updatedData: { location_x: overX, location_y: overY },
      })
    ).catch((err) => console.error("Error updating dragged table:", err));
  };

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  if (error) return <p className="text-error">Error: {error}</p>;

  return (
    <div className="h-full min-h-0 rounded-2xl p-0">
      <DndContext collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
        <DndMonitor setActiveTable={setActiveTable} tables={tables} />

        <div className="grid h-full min-h-0 w-full grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2.4fr)_minmax(220px,0.7fr)]">
          <TableLayout tables={tables} />
          <TableList tables={tables} />
        </div>

        <DragOverlay>
          {activeTable && (
            <div className="flex min-w-[120px] flex-col items-start justify-center rounded-md border border-accent/50 bg-accent/20 px-2 py-2 text-sm font-semibold text-text-primary shadow-lg">
              <p>Table {activeTable.number}</p>
              <p className="text-text-secondary">Seats {activeTable.capacity}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default TableManagementPage;
