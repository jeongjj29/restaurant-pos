import { useMemo } from "react";
import Table from "@tables/components/Table";
import { RootState } from "@app/store";
import { useAppSelector } from "@app/hooks";
import { createTableLayout } from "@utils/tableLayoutUtils";

function DineInPage() {
  const tables = useAppSelector((state: RootState) => state.tables.tables);
  const layout = useMemo(() => createTableLayout(tables), [tables]);

  return (
    <div className="glass-panel flex h-full items-center justify-center rounded-2xl p-3 md:p-4">
      <div className="relative w-full overflow-auto rounded-xl border border-border/80 bg-black/15 p-4">
        {layout.map((row, i) => (
          <div key={i} className="mb-2 flex flex-row justify-center gap-2">
            {row.map((col, j) => (
              <Table
                key={j}
                isTable={col.isTable}
                number={col.number || null}
                tableId={col.id || null}
                orders={col.orders || []}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DineInPage;
