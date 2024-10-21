import React from "react";
import DroppableTable from "./DroppableTable";
import { useSelector } from "react-redux";

function TablesLayout({ tables }) {
  const layout = useSelector((state) => state.tables.tableLayout);

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
