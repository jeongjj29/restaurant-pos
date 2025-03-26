import { useSelector } from "react-redux";
import Table from "@features/tables/components/Table";

function DineInPage() {
  const layout = useSelector((state) => state.tables.tableLayout);
  return (
    <div className="flex h-full">
      <div className="flex-1 self-center justify-self-center relative overflow-visible">
        {layout.map((row, i) => (
          <div key={i} className="flex flex-row gap-2 justify-center mb-2">
            {row.map((col, j) => (
              <Table
                key={j}
                isTable={col.isTable}
                number={col.number}
                xIndex={j}
                yIndex={i}
                tableId={col.id}
                orders={col.orders}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DineInPage;
