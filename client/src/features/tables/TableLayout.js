import React from "react";
import DroppableTable from "./DroppableTable";

function TablesLayout({ tables }) {
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

  return (
    <div className="flex-1 self-center justify-self-center relative overflow-visible">
      {layout.map((row, i) => (
        <div key={i} className="flex flex-row gap-2 justify-center mb-2">
          {row.map((col, j) => (
            <DroppableTable
              key={j}
              isTable={col.isTable}
              number={col.number}
              xIndex={j}
              yIndex={i}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default TablesLayout;
