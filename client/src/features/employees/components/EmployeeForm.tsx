import * as yup from "yup";
import { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { updateEmployee, addEmployee } from "../slices/employeesSlice";
import { fetchRoles } from "../slices/rolesSlice";
import { RootState } from "@app/store";
import { Employee } from "@employees/types";

interface EmployeeFormProps {
  employee: Employee | null;
  setFormHidden: (hidden: boolean) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
}

interface FormValues {
  first_name: string;
  last_name: string;
  phone_number: number | null;
  email: string;
  username: string;
  role_id: number;
  password: string;
}

const employeeSchema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  phone_number: yup.number().nullable(),
  email: yup.string().email("Invalid email").required("Email is required"),
  username: yup.string().required("Username is required"),
  role_id: yup.number().integer().required("Role is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

function EmployeeForm({
  employee,
  setFormHidden,
  setSelectedEmployee,
}: EmployeeFormProps) {
  const dispatch = useAppDispatch();
  const roles = useAppSelector((state: RootState) => state.roles.roles);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const initialValues: FormValues = {
    first_name: employee?.first_name ?? "",
    last_name: employee?.last_name ?? "",
    phone_number: employee?.phone_number ?? null,
    email: employee?.email ?? "",
    username: employee?.username ?? "",
    role_id: employee?.role_id ?? 1,
    password: "",
  };

  return (
    <div className="max-w-md mx-auto bg-surface p-8 rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4 text-text-primary">
        {employee ? "Update Employee" : "Create New Employee"}
      </h2>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={employeeSchema}
        onSubmit={(values, { resetForm }) => {
          if (employee) {
            dispatch(updateEmployee({ ...values, id: employee.id }))
              .unwrap()
              .then(() => {
                setSelectedEmployee(null);
                setFormHidden(true);
              });
          } else {
            dispatch(addEmployee(values))
              .unwrap()
              .then(() => {
                resetForm();
                setFormHidden(true);
              });
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-text-primary">
                First Name
              </label>
              <Field
                type="text"
                name="first_name"
                className="w-full p-3 border border-border bg-background text-text-primary rounded-md"
              />
              <ErrorMessage
                name="first_name"
                component="div"
                className="text-red-600 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-text-primary">
                Last Name
              </label>
              <Field
                type="text"
                name="last_name"
                className="w-full p-3 border border-border bg-background text-text-primary rounded-md"
              />
              <ErrorMessage
                name="last_name"
                component="div"
                className="text-red-600 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-text-primary">
                Email
              </label>
              <Field
                type="email"
                name="email"
                className="w-full p-3 border border-border bg-background text-text-primary rounded-md"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-600 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-text-primary">
                Username
              </label>
              <Field
                type="text"
                name="username"
                className="w-full p-3 border border-border bg-background text-text-primary rounded-md"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="text-red-600 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-text-primary">
                Phone Number
              </label>
              <Field
                type="text"
                name="phone_number"
                className="w-full p-3 border border-border bg-background text-text-primary rounded-md"
              />
              <ErrorMessage
                name="phone_number"
                component="div"
                className="text-red-600 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-text-primary">
                Role
              </label>
              <Field
                as="select"
                name="role_id"
                className="w-full p-3 border border-border bg-background text-text-primary rounded-md"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id} className="bg-surface">
                    {role.name}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="role_id"
                component="div"
                className="text-red-600 text-xs mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-text-primary">
                Password
              </label>
              <Field
                type="password"
                name="password"
                className="w-full p-3 border border-border bg-background text-text-primary rounded-md"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-600 text-xs mt-1"
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  isSubmitting ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
                } text-white font-bold py-2 px-4 rounded-md`}
              >
                {employee ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setFormHidden(true)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md"
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

export default EmployeeForm;
