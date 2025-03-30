import DroppableTable from "./DroppableTable";
import { useSelector } from "react-redux";
import { TABLE_LAYOUT } from "@constants";

function TablesLayout({ tables }) {
  const layout = useSelector((state) => state.tables.tableLayout);

  return (
    <div className="flex-1 h-full flex items-center justify-center bg-white/5 p-4 rounded-md">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${TABLE_LAYOUT.HEIGHT}, minmax(0, 1fr))`,
        }}
      >
        {layout.flatMap((row, i) =>
          row.map((col, j) => (
            <DroppableTable
              key={`${i}-${j}`}
              isTable={col.isTable}
              number={col.number}
              xIndex={j}
              yIndex={i}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TablesLayout;
