import React, { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables, updateTable } from "../../features/tables/tablesSlice";
import TableLayout from "../../features/tables/TableLayout";
import TableList from "../../features/tables/TableList";

function TableManagementPage() {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables.tables);
  const error = useSelector((state) => state.tables.error);

  const [selectedSpot, setSelectedSpot] = useState(null);

  useEffect(() => {
    dispatch(fetchTables()); // Fetch tables on component mount
  }, [dispatch]);

  // Handle assigning a table to a new spot
  const handleTableAssign = (tableId) => {
    // Remove table from the previous spot
    if (selectedSpot.tableId) {
      dispatch(
        updateTable({
          tableId: selectedSpot.tableId,
          updatedData: { location_x: null, location_y: null },
        })
      ).then(() => {
        if (!tableId) {
          setSelectedSpot(null);
          dispatch(fetchTables());
        }
      });
    }

    // Assign table to the new spot
    if (tableId) {
      dispatch(
        updateTable({
          tableId: tableId,
          updatedData: {
            location_x: selectedSpot.location_x,
            location_y: selectedSpot.location_y,
          },
        })
      ).then(() => {
        setSelectedSpot(null);
        dispatch(fetchTables());
      });
    }
  };

  function handleDragEnd(event) {
    const { active, over } = event;

    if (over) {
      const [overX, overY] = over.id.split("-");
      console.log(overX, overY);
      const occupiedLocation = tables.find(
        (table) =>
          table.location_x === parseInt(overX) &&
          table.location_y === parseInt(overY)
      );
      console.log(occupiedLocation);
      if (occupiedLocation) {
        dispatch(
          updateTable({
            tableId: occupiedLocation.id,
            updatedData: { location_x: null, location_y: null },
          })
        );
      }
      dispatch(
        updateTable({
          tableId: active.id,
          updatedData: { location_x: overX, location_y: overY },
        })
      );
    }
  }

  // Error handling
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className=" bg-gray-50 min-h-screen flex flex-row">
        {/* Grid Layout */}

        <TableLayout
          tables={tables}
          selectedSpot={selectedSpot}
          setSelectedSpot={setSelectedSpot}
        />

        {/* TableList (Scrollable) */}

        <TableList
          tables={tables}
          onTableClick={handleTableAssign}
          selectedSpot={selectedSpot}
          setSelectedSpot={setSelectedSpot}
        />
      </div>
    </DndContext>
  );
}

export default TableManagementPage;
