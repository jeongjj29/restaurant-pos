import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { updateMenuItem, addMenuItem } from "./menuItemsSlice";

function MenuItemForm({
  menuItemToEdit,
  setMenuItemToEdit,
  setEditFormHidden,
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
    <div className="bg-white p-6 rounded-md shadow-md mb-6">
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
          if (menuItemToEdit) {
            dispatch(updateMenuItem({ ...values, id: menuItemToEdit.id }))
              .unwrap()
              .then((res) => {
                console.log("Menu item updated successfully:", res);
                resetForm();
              })
              .catch((err) => {
                console.error("Error updating menu item:", err);
              })
              .finally(() => {
                setSubmitting(false);
                setEditFormHidden(true);
                setMenuItemToEdit(null);
              });
          } else {
            dispatch(addMenuItem(values))
              .unwrap()
              .then((res) => {
                console.log("Menu item added successfully:", res);
                resetForm();
              })
              .catch((err) => {
                console.error("Error adding menu item:", err);
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
            {/* Name Field */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <Field
                name="name"
                type="text"
                className="border border-gray-300 rounded-md w-full p-2"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            {/* Secondary Name Field */}
            <div className="mb-4">
              <label
                htmlFor="secondary_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Secondary Name
              </label>
              <Field
                name="secondary_name"
                type="text"
                className="border border-gray-300 rounded-md w-full p-2"
              />
              <ErrorMessage
                name="secondary_name"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            {/* Price Field */}
            <div className="mb-4">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price
              </label>
              <Field
                name="price"
                type="number"
                className="border border-gray-300 rounded-md w-full p-2"
              />
              <ErrorMessage
                name="price"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            {/* Category Field */}
            <div className="mb-4">
              <label
                htmlFor="category_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <Field
                as="select"
                name="category_id"
                className="border border-gray-300 rounded-md w-full p-2"
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
                className="text-red-600 text-sm mt-1"
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  menuItemToEdit ? "bg-green-600" : "bg-blue-600"
                } hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded`}
              >
                {menuItemToEdit ? "Update Menu Item" : "Add Menu Item"}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  setEditFormHidden(true);
                  setMenuItemToEdit(null);
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

export default MenuItemForm;
