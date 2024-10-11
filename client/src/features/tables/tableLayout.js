import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables } from "./tablesSlice";

function TablesLayout() {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables.tables);
  const loading = useSelector((state) => state.tables.loading);
  const error = useSelector((state) => state.tables.error);

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  console.log(tables);

  const createEmptyTableLayout = (rows, cols) => {
    const tableLayout = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push({ id: `${i}-${j}`, status: "available" });
      }
      tableLayout.push(row);
    }
    return tableLayout;
  };

  console.log(createEmptyTableLayout(12, 6));

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return <div className="grid grid-cols-12 grid-rows-6 gap-4"></div>;
}

export default TablesLayout;
