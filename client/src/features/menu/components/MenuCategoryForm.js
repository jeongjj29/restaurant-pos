import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { updateMenuCategory, addMenuCategory } from "./menuCategoriesSlice";

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
    <div className="bg-white p-6 rounded-md shadow-md mb-6">
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
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <Field
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                name="name"
                type="text"
                placeholder="Enter category name"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="secondary_name"
              >
                Secondary Name
              </label>
              <Field
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="secondary_name"
                name="secondary_name"
                type="text"
                placeholder="Enter secondary name (optional)"
              />
              <ErrorMessage
                name="secondary_name"
                component="div"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className={`${
                  isSubmitting ? "bg-blue-300" : "bg-blue-500"
                } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                type="submit"
                disabled={isSubmitting}
              >
                {menuCategoryToEdit ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuCategoryFormHidden(true);
                  setMenuCategoryToEdit(null);
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

export default MenuCategoryForm;
