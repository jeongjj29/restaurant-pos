import React, { useEffect, useState } from "react";
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

  const height = 5;
  const width = 9;

  // Handle clicking a table or empty spot
  const handleTableClick = (xIndex, yIndex, tableId) => {
    if (tableId) {
      setSelectedSpot({
        location_x: xIndex,
        location_y: yIndex,
        tableId: tableId,
      });
    } else {
      setSelectedSpot({ location_x: xIndex, location_y: yIndex });
    }
  };

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

  // Error handling
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className=" bg-gray-50 min-h-screen flex flex-row">
      {/* Grid Layout */}

      <TableLayout
        tables={tables}
        handleTableClick={handleTableClick}
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
  );
}

export default TableManagementPage;
