import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateTable, addNewTable, deleteTable } from "./tablesSlice";

function TableList({ tables, onTableClick, selectedSpot, setSelectedSpot }) {
  const dispatch = useDispatch();
  const [editFormHidden, setEditFormHidden] = useState(true);
  const [tableToEdit, setTableToEdit] = useState(null);
  const sortedTables = [...tables].sort((a, b) => a.number - b.number);

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

  return (
    <div className="w-160 h-screen overflow-y-auto bg-white p-4 shadow-lg p-6 bg-gray-100 rounded-md shadow-lg">
      {selectedSpot && (
        <button
          onClick={() => setSelectedSpot(null)}
          className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Cancel Table Selection
        </button>
      )}
      {/* Add New Table Button */}
      {editFormHidden && !selectedSpot && (
        <button
          className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={() => {
            setEditFormHidden(false);
            setTableToEdit(null);
          }}
        >
          Add New Table
        </button>
      )}

      {/* Form Section for Add/Edit */}
      {!editFormHidden && (
        <div className="bg-white p-6 rounded-md shadow-md mb-6">
          <Formik
            initialValues={{
              number: tableToEdit?.number || "",
              capacity: tableToEdit?.capacity || "",
            }}
            validationSchema={tableSchema}
            enableReinitialize={true}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              if (tableToEdit) {
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
                    setTableToEdit(null);
                  });
              } else {
                dispatch(addNewTable(values))
                  .unwrap()
                  .then((res) => {
                    console.log("Table added successfully:", res);
                    resetForm();
                  })
                  .catch((err) => {
                    console.error("Error adding table:", err);
                  })
                  .finally(() => {
                    setSubmitting(false);
                    setEditFormHidden(true);
                  });
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                {/* Form Fields */}
                <div className="mb-4">
                  <label
                    htmlFor="number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Table Number
                  </label>
                  <Field
                    name="number"
                    type="number"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                  <ErrorMessage
                    name="number"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="capacity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Capacity
                  </label>
                  <Field
                    name="capacity"
                    type="number"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                  <ErrorMessage
                    name="capacity"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${
                      tableToEdit ? "bg-green-600" : "bg-blue-600"
                    } hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded`}
                  >
                    {tableToEdit ? "Update Table" : "Add Table"}
                  </button>

                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditFormHidden(true);
                      setTableToEdit(null);
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {/* Table List */}
      <ul className="list-none space-y-4">
        {sortedTables.map((table) => (
          <li
            key={table.id}
            className="bg-white p-4 rounded-md shadow-md flex justify-between items-center"
          >
            {/* Table Information */}
            <span className="text-lg font-semibold">
              Table: {table.number} | Capacity: {table.capacity}
            </span>

            {/* Select Table Button */}
            {selectedSpot && (
              <button
                className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                onClick={() => onTableClick(table.id)}
              >
                Select
              </button>
            )}

            {/* Edit and Delete Buttons */}
            <div className="flex gap-2">
              {!selectedSpot && (
                <button
                  className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    setEditFormHidden(false);
                    setTableToEdit(table);
                  }}
                >
                  Edit
                </button>
              )}
              {!selectedSpot && (
                <button
                  className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    dispatch(deleteTable(table.id)) // Pass just the table ID
                      .unwrap() // Unwrap the result to handle the actual promise
                      .then((res) => {
                        console.log("Table deleted successfully:", res);
                      })
                      .catch((err) => {
                        console.error("Error deleting table:", err);
                      });
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}

        {/* Remove Assignment Button */}
        {selectedSpot && selectedSpot.tableId && (
          <button
            className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mt-4"
            onClick={() => onTableClick(null)}
          >
            Remove
          </button>
        )}
      </ul>
    </div>
  );
}

export default TableList;
