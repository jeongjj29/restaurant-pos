import React from "react";
import { useNavigate } from "react-router-dom";

function Table({ isTable, tableId, number, xIndex, yIndex }) {
  const navigate = useNavigate();
  if (isTable) {
    return (
      <div
        onClick={() => {
          navigate(`/orders/table/${number}`);
        }}
        className="text-2xl flex items-center justify-center w-24 h-24 border-2 rounded-lg text-white cursor-pointer bg-slate-400"
      >
        {number}
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center w-24 h-24  rounded-lg"></div>
    );
  }
}

export default Table;
