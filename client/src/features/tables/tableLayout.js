import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables } from "./tablesSlice";
import Table from "./Table";
import TableList from "./TableList";

function TablesLayout() {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables.tables);
  const loading = useSelector((state) => state.tables.loading);
  const error = useSelector((state) => state.tables.error);

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const height = 5;
  const width = 9;

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

  const tableLayout = createEmptyTableLayout(height, width);

  tables.forEach((table) => {
    if (table.location_x !== null && table.location_y !== null) {
      tableLayout[table.location_y][table.location_x] = {
        isTable: true,
        ...table,
      };
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {tableLayout.map((row, i) => (
        <div key={i} className="flex flex-row m-2 gap-2">
          {row.map((col, j) => (
            <Table
              key={j}
              isTable={col.isTable}
              tableId={col.id}
              number={col.number}
              orders={col.orders}
              capacity={col.capacity}
            />
          ))}
        </div>
      ))}
      <TableList tables={tables} />
    </div>
  );
}

export default TablesLayout;
