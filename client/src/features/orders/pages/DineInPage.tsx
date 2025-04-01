import { useMemo } from "react";
import Table from "@tables/components/Table";
import { RootState } from "@app/store";
import { useAppSelector } from "@app/hooks";
import { createTableLayout } from "@utils/tableLayoutUtils";

function DineInPage() {
  const tables = useAppSelector((state: RootState) => state.tables.tables);
  const layout = useMemo(() => createTableLayout(tables), [tables]);

  return (
    <div className="flex h-full">
      <div className="flex-1 self-center justify-self-center relative overflow-visible">
        {layout.map((row, i) => (
          <div key={i} className="flex flex-row gap-2 justify-center mb-2">
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
