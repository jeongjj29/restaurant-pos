import DroppableTable from "./DroppableTable";
import { TablesLayoutProps } from "@tables/types";
import { TABLE_LAYOUT } from "@constants";
import { createTableLayout } from "@utils/tableLayoutUtils";

function TablesLayout({ tables }: TablesLayoutProps) {
  const layout = createTableLayout(tables);

  return (
    <div className="h-full min-h-0 rounded-xl border border-border bg-white/5 p-3">
      <div className="h-full w-full min-h-0 overflow-auto">
        <div className="flex min-h-full min-w-full items-center justify-center">
          <div
            className="grid w-max gap-2"
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
      </div>
    </div>
  );
}

export default TablesLayout;
