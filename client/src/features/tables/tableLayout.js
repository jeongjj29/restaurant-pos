import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables } from "./tablesSlice";
import Table from "./Table";

function TablesLayout() {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables.tables);
  const loading = useSelector((state) => state.tables.loading);
  const error = useSelector((state) => state.tables.error);

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  // console.log(tables);
  //   {
  //     "capacity": 6,
  //     "id": 1,
  //     "location_x": null,
  //     "location_y": null,
  //     "number": 1,
  //     "orders": []
  // }

  const rows = 6;
  const cols = 12;

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
  const emptyTableLayout = createEmptyTableLayout(rows, cols);

  const loadTables = () => {
    tables.forEach((table) => {
      if (table["location_x"] === null || table["location_y"] === null) {
        return;
      }
      const row = table["location_x"];
      const col = table["location_y"];
      emptyTableLayout[row][col] = { isTable: true, ...table };
    });
  };

  loadTables();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {emptyTableLayout.map((row, i) => (
        <div key={i} className="flex flex-row m-2 gap-2">
          {row.map((col, j) => (
            <Table key={j} isTable={col.isTable} table={col} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default TablesLayout;
