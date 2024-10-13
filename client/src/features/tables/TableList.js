import React from "react";

function TableList({ tables, onTableClick, onCloseList }) {
  return (
    <div>
      <button onClick={() => onCloseList()}>Close</button>
      <ul>
        {tables.map((table) => (
          <li key={table.id}>
            <button onClick={() => onTableClick(table.id)}>
              Table: {table.number} | Capacity: {table.capacity}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TableList;
