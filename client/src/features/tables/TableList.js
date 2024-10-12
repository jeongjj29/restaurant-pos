import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables } from "./tablesSlice";

function TableList(tables) {
  const tablesArr = tables.tables;

  return (
    <div>
      <ul>
        {tablesArr.map((table) => (
          <li key={table.id}>
            Table: {table.number} | Capacity: {table.capacity}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TableList;
