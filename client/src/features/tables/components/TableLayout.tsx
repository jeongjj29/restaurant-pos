import DroppableTable from "./DroppableTable";
import { TablesLayoutProps } from "@tables/types";
import { TABLE_LAYOUT } from "@constants";
import { createTableLayout } from "@utils/tableLayoutUtils";

function TablesLayout({ tables }: TablesLayoutProps) {
  const layout = createTableLayout(tables);

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
              number={col.number || undefined}
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
