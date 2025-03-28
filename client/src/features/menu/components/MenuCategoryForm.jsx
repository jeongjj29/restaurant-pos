import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import {
  updateMenuCategory,
  addMenuCategory,
} from "@menu/slices/menuCategoriesSlice";

function MenuCategoryForm({
  menuCategoryToEdit,
  setMenuCategoryToEdit,
  setMenuCategoryFormHidden,
}) {
  const dispatch = useDispatch();

  const menuCategorySchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    secondary_name: yup.string(),
  });

  return (
    <div className="bg-surface p-4 rounded-md shadow-md text-text-primary border border-border">
      <Formik
        initialValues={{
          name: menuCategoryToEdit?.name || "",
          secondary_name: menuCategoryToEdit?.secondary_name || "",
        }}
        validationSchema={menuCategorySchema}
        enableReinitialize={true}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          const submitAction = menuCategoryToEdit
            ? updateMenuCategory({ ...values, id: menuCategoryToEdit.id })
            : addMenuCategory(values);

          dispatch(submitAction)
            .unwrap()
            .then(() => {
              resetForm();
              setMenuCategoryToEdit(null);
              setMenuCategoryFormHidden(true);
            })
            .catch((err) => {
              console.error(err);
            })
            .finally(() => {
              setSubmitting(false);
            });
        }}
      >
        {({ isSubmitting }) => (
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

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-md transition duration-200 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {menuCategoryToEdit ? "Update" : "Add"}
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
