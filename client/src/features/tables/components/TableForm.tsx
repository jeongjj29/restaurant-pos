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
      .typeError("Table number must be a number")
      .integer("Table number must be a whole number")
      .positive("Table number must be greater than 0")
      .required("Number is required")
      .test("unique-number", "Table number already exists", function (value) {
        if (tableToEdit && tableToEdit.number === value) {
          return true;
        }
        return !tables.some((table) => table.number === value);
      }),
    capacity: yup
      .number()
      .typeError("Capacity must be a number")
      .integer("Capacity must be a whole number")
      .min(1, "Capacity must be at least 1")
      .required("Capacity is required"),
  });

  return (
    <div className="mx-auto w-full max-w-md rounded-md bg-white/5 p-4 shadow-md">
      <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">
        Floor plan
      </p>
      <h2 className="mb-4 mt-1 text-xl font-semibold">
        {tableToEdit ? `Edit table ${tableToEdit.number}` : "Add a table"}
      </h2>
      <Formik<TableFormValues>
        initialValues={{
          number: tableToEdit?.number ?? "",
          capacity: tableToEdit?.capacity ?? "",
        }}
        validationSchema={tableSchema}
        enableReinitialize
        onSubmit={async (
          values,
          { setSubmitting, resetForm, setStatus }
        ) => {
          setStatus(null);
          const parsedValues = {
            number: Number(values.number),
            capacity: Number(values.capacity),
          };

          try {
            if (tableToEdit) {
              await dispatch(
                updateTable({
                  tableId: tableToEdit.id,
                  updatedData: parsedValues,
                })
              ).unwrap();
            } else {
              await dispatch(addTable(parsedValues)).unwrap();
            }

            resetForm();
            setEditFormHidden(true);
            setTableToEdit(null);
          } catch (error: unknown) {
            setStatus(
              typeof error === "string"
                ? error
                : "Table changes could not be saved"
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status }) => (
          <Form>
            <div className="mb-4">
              <label
                htmlFor="number"
                className="block text-base font-medium mb-1"
              >
                Table Number
              </label>
              <Field
                id="number"
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
                id="capacity"
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

            {status && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-error/40 bg-error/10 p-3 text-sm text-error"
              >
                {status}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  tableToEdit ? "bg-green-600" : "bg-blue-600"
                } hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded`}
              >
                {isSubmitting
                  ? "Saving…"
                  : tableToEdit
                    ? "Update Table"
                    : "Add Table"}
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
