import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables } from "./tablesSlice";
import Table from "./Table";
import TableList from "./TableList";
import axios from "axios";

function TablesLayout() {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables.tables);
  const loading = useSelector((state) => state.tables.loading);
  const error = useSelector((state) => state.tables.error);

  const [selectedSpot, setSelectedSpot] = useState(null);
  const [formHidden, setFormHidden] = useState(true);

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

  const layout = createEmptyTableLayout(height, width);

  tables.forEach((table) => {
    if (table.location_x !== null && table.location_y !== null) {
      layout[table.location_y][table.location_x] = {
        isTable: true,
        ...table,
      };
    }
  });

  const handleTableClick = (xIndex, yIndex) => {
    console.log(xIndex, yIndex);
    setSelectedSpot({ location_x: xIndex, location_y: yIndex });
  };

  const handleTableAssign = (tableId) => {
    console.log(tableId);
    axios.patch(`/tables/${tableId}`, selectedSpot).then(() => {
      setSelectedSpot(null);
      dispatch(fetchTables());
    });
  };

  const handleCloseList = () => {
    setSelectedSpot(null);
  };

  const handleAddTableButton = () => {
    setFormHidden(!formHidden);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {layout.map((row, i) => (
        <div key={i} className="flex flex-row m-2 gap-2">
          {row.map((col, j) => (
            <Table
              key={j}
              isTable={col.isTable}
              tableId={col.id}
              number={col.number}
              orders={col.orders}
              capacity={col.capacity}
              onTableClick={handleTableClick}
              xIndex={j}
              yIndex={i}
            />
          ))}
        </div>
      ))}
      {selectedSpot && (
        <TableList
          tables={tables}
          onTableClick={handleTableAssign}
          onCloseList={handleCloseList}
        />
      )}
      <button>Add Table</button>
    </div>
  );
}

export default TablesLayout;
