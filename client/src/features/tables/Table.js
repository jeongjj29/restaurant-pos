import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";

function Table({ isTable, tableId, number, orders }) {
  const navigate = useNavigate();
  if (isTable) {
    return (
      <div
        onClick={() => {
          axios.get(`/orders/table/${tableId}`).then((res) => {
            const orders = res.data;
            if (orders.length > 0) {
              navigate(`/orders/${tableId}`);
            } else {
              navigate(`/orders/table/${tableId}/new`);
            }
          });
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
