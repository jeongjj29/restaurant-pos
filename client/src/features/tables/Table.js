import React from "react";
import { useDispatch } from "react-redux";

function Table({ isTable, tableId, capacity, orders, number }) {
  const dispatch = useDispatch();

  handleClick = () => {};

  if (isTable) {
    return (
      <div className="w-12 h-12 bg-black text-white flex justify-center items-center rounded text-2xl">
        {number}
      </div>
    );
  } else {
    return <div className="w-12 h-12 bg-black"></div>;
  }
}

export default Table;
