import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables, updateTable } from "./tablesSlice"; // Import updateTable

import Table from "./Table";
import TableList from "./TableList";

function TablesLayout() {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables.tables);
  const error = useSelector((state) => state.tables.error);

  const [selectedSpot, setSelectedSpot] = useState(null);

  useEffect(() => {
    dispatch(fetchTables()); // Fetch tables on component mount
  }, [dispatch]);

  const height = 5;
  const width = 9;

  // Creates an empty grid layout for tables
  const createEmptyTableLayout = (r, c) => {
    const tableLayout = [];
    for (let i = 0; i < r; i++) {
      const row = [];
      for (let j = 0; j < c; j++) {
        row.push({ isTable: false });
      }
      tableLayout.push(row);
    }
    return tableLayout;
  };

  const layout = createEmptyTableLayout(height, width);

  // Place tables on the layout
  tables.forEach((table) => {
    if (table.location_x !== null && table.location_y !== null) {
      layout[table.location_y][table.location_x] = {
        isTable: true,
        ...table,
      };
    }
  });

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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Render grid layout */}
      <div className="mb-8">
        {layout.map((row, i) => (
          <div key={i} className="flex flex-row gap-2 justify-center mb-2">
            {row.map((col, j) => (
              <Table
                key={j}
                isTable={col.isTable}
                tableId={col.id}
                number={col.number}
                onTableClick={handleTableClick}
                xIndex={j}
                yIndex={i}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Render table list for assigning tables */}
      <TableList
        tables={tables}
        onTableClick={handleTableAssign}
        selectedSpot={selectedSpot}
      />
    </div>
  );
}

export default TablesLayout;
