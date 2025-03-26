import React, { useEffect } from "react";
import { DndContext } from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables, updateTable } from "../../features/tables/tablesSlice";
import TableLayout from "../../features/tables/TableLayout";
import TableList from "../../features/tables/TableList";

function TableManagementPage() {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables.tables);
  const error = useSelector((state) => state.tables.error);
  const loading = useSelector((state) => state.tables.loading); // Assume this exists in your slice

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
      <div className="w-full h-full flex gap-4 rounded-md overflow-visible">
        {/* Grid Layout */}
        <TableLayout tables={tables} />

        {/* TableList (Scrollable) */}
        <TableList tables={tables} />
      </div>
    </DndContext>
  );
}

export default TableManagementPage;
