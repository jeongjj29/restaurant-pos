import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTables, addNewTable, updateTable } from "./tablesSlice"; // Import updateTable
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import Table from "./Table";
import TableList from "./TableList";

function TablesLayout() {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.tables.tables);
  const error = useSelector((state) => state.tables.error);

  const [selectedSpot, setSelectedSpot] = useState(null);
  const [formHidden, setFormHidden] = useState(true);

  // Validation schema for form
  const tableSchema = yup.object().shape({
    number: yup
      .number()
      .required("Number is required")
      .test("unique-number", "Table number already exists", function (value) {
        return !tables.some((table) => table.number === value);
      }),
    capacity: yup
      .number()
      .min(1, "Capacity must be at least 1")
      .required("Capacity is required"),
  });

  useEffect(() => {
    dispatch(fetchTables()); // Fetch tables on component mount
  }, [dispatch]);

  const height = 5;
  const width = 9;

  // Creates an empty grid layout for tables
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

  // Place tables on the layout
  tables.forEach((table) => {
    if (table.location_x !== null && table.location_y !== null) {
      layout[table.location_y][table.location_x] = {
        isTable: true,
        ...table,
      };
    }
  });

  // Handle clicking a table or empty spot
  const handleTableClick = (xIndex, yIndex, tableId) => {
    if (tableId) {
      setSelectedSpot({
        location_x: xIndex,
        location_y: yIndex,
        tableId: tableId,
      });
    } else {
      setSelectedSpot({ location_x: xIndex, location_y: yIndex });
    }
  };

  // Handle assigning a table to a new spot
  const handleTableAssign = (tableId) => {
    // Remove table from the previous spot
    if (selectedSpot.tableId) {
      dispatch(
        updateTable({
          tableId: selectedSpot.tableId,
          updatedData: { location_x: null, location_y: null },
        })
      ).then(() => {
        if (!tableId) {
          setSelectedSpot(null);
          dispatch(fetchTables());
        }
      });
    }

    // Assign table to the new spot
    if (tableId) {
      dispatch(
        updateTable({
          tableId: tableId,
          updatedData: {
            location_x: selectedSpot.location_x,
            location_y: selectedSpot.location_y,
          },
        })
      ).then(() => {
        setSelectedSpot(null);
        dispatch(fetchTables());
      });
    }
  };

  // Toggle Add Table form visibility
  const handleAddTableButton = () => {
    setFormHidden(!formHidden);
  };

  // Error handling
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {/* Render grid layout */}
      {layout.map((row, i) => (
        <div key={i} className="flex flex-row m-2 gap-2">
          {row.map((col, j) => (
            <Table
              key={j}
              isTable={col.isTable}
              tableId={col.id}
              number={col.number}
              onTableClick={handleTableClick}
              xIndex={j}
              yIndex={i}
            />
          ))}
        </div>
      ))}

      {/* Render table list for assigning tables */}
      <TableList
        tables={tables}
        onTableClick={handleTableAssign}
        selectedSpot={selectedSpot}
      />

      {/* Add Table Button */}
      <button onClick={handleAddTableButton}>Add Table</button>

      {/* Add Table Form */}
      {!formHidden && (
        <Formik
          initialValues={{ number: "", capacity: "" }}
          validationSchema={tableSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            dispatch(addNewTable(values))
              .unwrap()
              .then((res) => {
                console.log("New table created: ", res);
                resetForm();
              })
              .catch((err) => {
                console.error("Error creating table: ", err);
              })
              .finally(() => {
                setSubmitting(false);
                setFormHidden(true);
              });
          }}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-2">
              <div>
                <label htmlFor="number">Table Number</label>
                <Field type="number" name="number" />
                <ErrorMessage name="number" component="div" />
              </div>
              <div>
                <label htmlFor="capacity">Capacity</label>
                <Field type="number" name="capacity" />
                <ErrorMessage name="capacity" component="div" />
              </div>
              <button type="submit" disabled={isSubmitting}>
                Submit
              </button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
}

export default TablesLayout;
