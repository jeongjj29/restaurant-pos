import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { updateMenuItem, addMenuItem } from "@menu/slices/menuItemsSlice";

function MenuItemForm({
  menuItemToEdit,
  setMenuItemToEdit,
  setMenuItemFormHidden,
}) {
  const dispatch = useDispatch();
  const menuCategories = useSelector(
    (state) => state.menuCategories.menuCategories
  );

  const menuItemSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    secondary_name: yup.string(),
    price: yup
      .number()
      .min(0.01, "Price must be greater than 0")
      .required("Price is required"),
    category_id: yup.number().required("Category is required"),
  });

  return (
    <div className="bg-surface p-6 rounded-md shadow-md mb-6 border border-border">
      <Formik
        initialValues={{
          name: menuItemToEdit?.name || "",
          secondary_name: menuItemToEdit?.secondary_name || "",
          price: menuItemToEdit?.price || "",
          category_id: menuItemToEdit?.category_id || "",
        }}
        validationSchema={menuItemSchema}
        enableReinitialize={true}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          const action = menuItemToEdit
            ? updateMenuItem({ ...values, id: menuItemToEdit.id })
            : addMenuItem(values);

          dispatch(action)
            .unwrap()
            .then(() => resetForm())
            .catch((err) => console.error("Error submitting menu item:", err))
            .finally(() => {
              setSubmitting(false);
              setMenuItemFormHidden(true);
              setMenuItemToEdit(null);
            });
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            {/* Name Field */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Name
              </label>
              <Field
                name="name"
                type="text"
                className="border border-border bg-white/5 text-text-primary rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-accent"
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
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Secondary Name
              </label>
              <Field
                name="secondary_name"
                type="text"
                className="border border-border bg-white/5 text-text-primary rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <ErrorMessage
                name="secondary_name"
                component="div"
                className="text-error text-sm mt-1"
              />
            </div>

            {/* Price Field */}
            <div className="mb-4">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Price
              </label>
              <Field
                name="price"
                type="number"
                className="border border-border bg-white/5 text-text-primary rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <ErrorMessage
                name="price"
                component="div"
                className="text-error text-sm mt-1"
              />
            </div>

            {/* Category Field */}
            <div className="mb-6">
              <label
                htmlFor="category_id"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Category
              </label>
              <Field
                as="select"
                name="category_id"
                className="border border-border bg-white/5 text-text-primary rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Category</option>
                {menuCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="category_id"
                component="div"
                className="text-error text-sm mt-1"
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  menuItemToEdit
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-blue-600 hover:bg-blue-500"
                } text-white font-bold py-2 px-4 rounded-md transition-colors duration-200`}
              >
                {menuItemToEdit ? "Update Menu Item" : "Add Menu Item"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuItemFormHidden(true);
                  setMenuItemToEdit(null);
                }}
                className="bg-white/10 hover:bg-white/20 text-text-secondary hover:text-text-primary font-bold py-2 px-4 rounded-md transition-colors duration-200"
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

export default MenuItemForm;
