import { Formik, Form, Field, ErrorMessage } from "formik";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateTable, deleteTable } from "./tablesSlice";

function TableList({
  tables,
  onTableClick,
  selectedSpot,
  onDelete,
  tableSchema,
}) {
  const dispatch = useDispatch();

  const [editFormHidden, setEditFormHidden] = useState(true);
  const [tableToEdit, setTableToEdit] = useState(null);
  const sortedTables = [...tables].sort((a, b) => a.number - b.number);

  return (
    <div>
      {!editFormHidden && (
        <div>
          <Formik
            initialValues={{
              number: tableToEdit.number,
              capacity: tableToEdit.capacity,
            }}
            validationSchema={tableSchema}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              dispatch(updateTable({ ...values, id: tableToEdit.id }))
                .unwrap()
                .then((res) => {
                  console.log("Table updated successfully:", res);
                  resetForm();
                })
                .catch((err) => {
                  console.error("Error updating table:", err);
                })
                .finally(() => {
                  setSubmitting(false);
                  setEditFormHidden(true);
                });
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <label htmlFor="number">Number</label>
                <Field name="number" type="number" />
                <ErrorMessage name="number" component="div" />
                <label htmlFor="capacity">Capacity</label>
                <Field name="capacity" type="number" />
                <ErrorMessage name="capacity" component="div" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Save
                </button>
              </Form>
            )}
          </Formik>
        </div>
      )}
      <ul className="list-none space-y-2">
        {sortedTables.map((table) => (
          <li key={table.id} className="flex justify-between items-center">
            {selectedSpot && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => onTableClick(table.id)}
              >
                Select
              </button>
            )}
            <span>
              Table: {table.number} | Capacity: {table.capacity}
            </span>
            <div className="flex gap-2">
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  setEditFormHidden(!editFormHidden);
                  setTableToEdit(table);
                }}
              >
                Edit
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  dispatch(
                    deleteTable({
                      tableId: table.id,
                    })
                      .unwrap()
                      .then((res) => {
                        console.log("Table deleted successfully:", res);
                      })
                      .catch((err) => {
                        console.error("Error deleting table:", err);
                      })
                  );
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {selectedSpot && selectedSpot.tableId && (
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => onTableClick(null)} // Clear assignment
          >
            Remove
          </button>
        )}
      </ul>
    </div>
  );
}

export default TableList;
