import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import {
  updateMenuCategory,
  addMenuCategory,
} from "@menu/slices/menuCategoriesSlice";
import { AppDispatch } from "@app/store";
import { MenuCategory } from "@menu/types";

interface FormValues {
  name: string;
  secondary_name: string;
}

interface Props {
  menuCategoryToEdit: MenuCategory | null;
  setMenuCategoryToEdit: (category: MenuCategory | null) => void;
  setMenuCategoryFormHidden: (hidden: boolean) => void;
}

function MenuCategoryForm({
  menuCategoryToEdit,
  setMenuCategoryToEdit,
  setMenuCategoryFormHidden,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const menuCategorySchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    secondary_name: yup.string().nullable(),
  });

  const initialValues: FormValues = {
    name: menuCategoryToEdit?.name || "",
    secondary_name: menuCategoryToEdit?.secondary_name || "",
  };

  return (
    <div className="bg-surface p-4 rounded-md shadow-md text-text-primary border border-border">
      <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">
        Menu organization
      </p>
      <h2 className="mb-5 mt-1 text-xl font-semibold">
        {menuCategoryToEdit ? "Edit category" : "Add category"}
      </h2>
      <Formik
        initialValues={initialValues}
        validationSchema={menuCategorySchema}
        enableReinitialize
        onSubmit={async (
          values,
          { setSubmitting, resetForm, setStatus }
        ) => {
          setStatus(null);
          const formattedValues = {
            name: values.name.trim(),
            secondary_name: values.secondary_name.trim() || null,
          };
          const action = menuCategoryToEdit
            ? updateMenuCategory({
                ...formattedValues,
                id: menuCategoryToEdit.id,
              })
            : addMenuCategory(formattedValues);

          try {
            await dispatch(action).unwrap();
            resetForm();
            setMenuCategoryToEdit(null);
            setMenuCategoryFormHidden(true);
          } catch (error: unknown) {
            setStatus(
              typeof error === "string"
                ? error
                : "Category changes could not be saved"
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status }) => (
          <Form>
            {/* Name Field */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <Field
                name="name"
                type="text"
                placeholder="Enter category name"
                className="w-full p-2 rounded-md bg-white/10 border border-border text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-2 focus:ring-accent"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-error text-sm mt-1"
              />
            </div>

            {/* Secondary Name Field */}
            <div className="mb-4">
              <label
                htmlFor="secondary_name"
                className="block text-sm font-medium mb-1"
              >
                Secondary Name
              </label>
              <Field
                name="secondary_name"
                type="text"
                placeholder="Optional"
                className="w-full p-2 rounded-md bg-white/10 border border-border text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-2 focus:ring-accent"
              />
              <ErrorMessage
                name="secondary_name"
                component="div"
                className="text-error text-sm mt-1"
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

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-md transition duration-200 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting
                  ? "Saving…"
                  : menuCategoryToEdit
                    ? "Update"
                    : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuCategoryFormHidden(true);
                  setMenuCategoryToEdit(null);
                }}
                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-md transition duration-200"
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

export default MenuCategoryForm;
