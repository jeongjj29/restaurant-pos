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
      <div className="w-12 h-12 bg-black text-white flex justify-center items-center rounded text-2xl">
        {number}
      </div>
    );
  } else {
    return (
      <div
        className="w-12 h-12 bg-black"
        onClick={() => onTableClick(xIndex, yIndex)}
      ></div>
    );
  }
}

export default Table;
