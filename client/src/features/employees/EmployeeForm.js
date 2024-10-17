import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { fetchRoles } from "./rolesSlice";
import * as yup from "yup";

// Employee form validation schema
const employeeSchema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  username: yup.string().required("Username is required"),
  role_id: yup.number().integer().required("Role is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

function EmployeeForm({ employee, onSubmit }) {
  const dispatch = useDispatch();
  const roles = useSelector((state) => state.roles.roles);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">
        {employee ? "Update Employee" : "Create New Employee"}
      </h2>

      <Formik
        initialValues={{
          first_name: employee?.first_name || "",
          last_name: employee?.last_name || "",
          email: employee?.email || "",
          username: employee?.username || "",
          role_id: employee?.role_id || "",
          password: "",
        }}
        validationSchema={employeeSchema}
        onSubmit={(values, { resetForm }) => {
          onSubmit(values);
          resetForm();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            {/* First Name */}
            <div className="mb-4">
              <label htmlFor="first_name" className="block text-sm font-medium">
                First Name
              </label>
              <Field
                type="text"
                name="first_name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage
                name="first_name"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Last Name */}
            <div className="mb-4">
              <label htmlFor="last_name" className="block text-sm font-medium">
                Last Name
              </label>
              <Field
                type="text"
                name="last_name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage
                name="last_name"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <Field
                type="email"
                name="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Username */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <Field
                type="text"
                name="username"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Role */}
            <div className="mb-4">
              <label htmlFor="role_id" className="block text-sm font-medium">
                Role
              </label>
              <Field
                as="select"
                name="role_id"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" label="Select role" />
                {roles.map((role) => (
                  <option key={role.id} value={role.id} label={role.name} />
                ))}
              </Field>
              <ErrorMessage
                name="role_id"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Field
                type="password"
                name="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : employee
                ? "Update Employee"
                : "Create Employee"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default EmployeeForm;
