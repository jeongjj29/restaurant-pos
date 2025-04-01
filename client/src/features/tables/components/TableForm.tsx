import * as yup from "yup";
import { useAppDispatch } from "@app/hooks";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { updateTable, addTable } from "../slices/tablesSlice";
import { Table } from "@tables/types";

interface TableFormProps {
  tables: Table[];
  tableToEdit: Table | null;
  setTableToEdit: (table: Table | null) => void;
  setEditFormHidden: (value: boolean) => void;
}

interface TableFormValues {
  number: number | string;
  capacity: number | string;
}

function TableForm({
  tables,
  tableToEdit,
  setTableToEdit,
  setEditFormHidden,
}: TableFormProps) {
  const dispatch = useAppDispatch();

  const tableSchema = yup.object().shape({
    number: yup
      .number()
      .required("Number is required")
      .test("unique-number", "Table number already exists", function (value) {
        if (tableToEdit && tableToEdit.number === value) {
          return true;
        }
        return !tables.some((table) => table.number === value);
      }),
    capacity: yup
      .number()
      .min(1, "Capacity must be at least 1")
      .required("Capacity is required"),
  });

  return (
    <div className="bg-white/5 p-6 mx-10 rounded-md shadow-md">
      <Formik<TableFormValues>
        initialValues={{
          number: tableToEdit?.number ?? "",
          capacity: tableToEdit?.capacity ?? "",
        }}
        validationSchema={tableSchema}
        enableReinitialize
        onSubmit={(values, { setSubmitting, resetForm }) => {
          const parsedValues = {
            number: Number(values.number),
            capacity: Number(values.capacity),
          };

          if (tableToEdit) {
            dispatch(
              updateTable({
                tableId: tableToEdit.id,
                updatedData: parsedValues,
              })
            )
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
            dispatch(addTable(parsedValues))
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
            <div className="mb-4">
              <label
                htmlFor="number"
                className="block text-base font-medium mb-1"
              >
                Table Number
              </label>
              <Field
                name="number"
                type="number"
                className="border border-border bg-white/10 rounded-md w-full p-2"
              />
              <ErrorMessage
                name="number"
                component="div"
                className="text-red-600 text-base mt-1"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="capacity"
                className="block text-base font-medium mb-1"
              >
                Capacity
              </label>
              <Field
                name="capacity"
                type="number"
                className="border border-border bg-white/10 rounded-md w-full p-2"
              />
              <ErrorMessage
                name="capacity"
                component="div"
                className="text-red-600 text-base mt-1"
              />
            </div>

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

              <button
                type="button"
                onClick={() => {
                  setEditFormHidden(true);
                  setTableToEdit(null);
                }}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-sm"
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
