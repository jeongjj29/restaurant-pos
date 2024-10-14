import React from "react";

function Table({
  isTable,
  tableId,
  capacity,
  orders,
  number,
  xIndex,
  yIndex,
  onTableClick,
}) {
  if (isTable) {
    return (
      <div
        onClick={() => onTableClick(xIndex, yIndex, tableId)}
        className="text-2xl flex items-center justify-center w-24 h-24 border-2 rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
      >
        {number}
      </div>
    );
  } else {
    return (
      <div
        className="flex items-center justify-center w-24 h-24 border-2 rounded-lg bg-gray-300 cursor-pointer hover:bg-gray-400"
        onClick={() => onTableClick(xIndex, yIndex)}
      ></div>
    );
  }
}

export default Table;
