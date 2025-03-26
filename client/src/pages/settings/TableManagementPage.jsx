import React, { useEffect, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables, updateTable } from "../../features/tables/tablesSlice";
import DndMonitor from "../../features/tables/DndMonitor";
import TableLayout from "../../features/tables/TableLayout";
import TableList from "../../features/tables/TableList";

function TableManagementPage() {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables.tables);
  const error = useSelector((state) => state.tables.error);
  const loading = useSelector((state) => state.tables.loading);

  const [activeTable, setActiveTable] = useState(null);

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over) {
      const [overX, overY] = over.id.split("-");
      const occupiedLocation = tables.find(
        (table) =>
          table.location_x === parseInt(overX) &&
          table.location_y === parseInt(overY)
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
          tableId: active.id,
          updatedData: { location_x: overX, location_y: overY },
        })
      ).catch((err) => console.error("Error updating dragged table:", err));
    }
  };

  // Error handling
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (loading) return <p className="text-gray-600">Loading tables...</p>;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DndMonitor setActiveTable={setActiveTable} tables={tables} />

      <div className="w-full h-full flex gap-4 rounded-md overflow-visible">
        <TableLayout tables={tables} />

        <TableList tables={tables} />
      </div>

      <DragOverlay>
        {activeTable ? (
          <div className="text-lg font-semibold flex flex-col justify-center items-center rounded-md px-2 py-4 bg-white/10 shadow-lg">
            <p>Table: {activeTable.number}</p>
            <p>Seats: {activeTable.capacity}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default TableManagementPage;
