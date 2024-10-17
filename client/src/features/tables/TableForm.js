import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { updateTable, addNewTable } from "./tablesSlice";

function TableForm({ tables, tableToEdit, setTableToEdit, setEditFormHidden }) {
  const dispatch = useDispatch();

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
  );
}

export default TableForm;
