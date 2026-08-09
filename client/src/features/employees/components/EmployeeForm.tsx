import { useEffect, useRef } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as yup from "yup";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { Employee } from "@employees/types";
import { addEmployee, updateEmployee } from "../slices/employeesSlice";
import { fetchRoles } from "../slices/rolesSlice";

interface EmployeeFormProps {
  employee: Employee | null;
  setFormHidden: (hidden: boolean) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
}

interface FormValues {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  username: string;
  role_id: number | "";
  password: string;
}

const fieldClassName =
  "w-full rounded-lg border border-border bg-white/5 px-3 py-2.5 text-text-primary focus:border-accent focus:outline-none";
const errorClassName = "mt-1 text-xs text-error";

const employeeSchema = (isEditing: boolean) =>
  yup.object({
    first_name: yup
      .string()
      .trim()
      .min(3, "First name must be at least 3 characters")
      .required("First name is required"),
    last_name: yup
      .string()
      .trim()
      .min(3, "Last name must be at least 3 characters")
      .required("Last name is required"),
    phone_number: yup
      .string()
      .trim()
      .matches(/^\d{10}$/, {
        message: "Phone number must be exactly 10 digits",
        excludeEmptyString: true,
      }),
    email: yup
      .string()
      .trim()
      .email("Enter a valid email address")
      .required("Email is required"),
    username: yup
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .required("Username is required"),
    role_id: yup
      .number()
      .typeError("Role is required")
      .integer()
      .positive()
      .required("Role is required"),
    password: isEditing
      ? yup.string()
      : yup
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
  const roles = useAppSelector((state) => state.roles.roles);
  const rolesLoading = useAppSelector((state) => state.roles.loading);
  const rolesError = useAppSelector((state) => state.roles.error);
  const isEditing = employee !== null;
  const requestedRoles = useRef(false);

  useEffect(() => {
    if (roles.length === 0 && !requestedRoles.current) {
      requestedRoles.current = true;
      void dispatch(fetchRoles());
    }
  }, [dispatch, roles.length]);

  const closeForm = () => {
    setSelectedEmployee(null);
    setFormHidden(true);
  };

  const initialValues: FormValues = {
    first_name: employee?.first_name ?? "",
    last_name: employee?.last_name ?? "",
    phone_number: employee?.phone_number?.toString() ?? "",
    email: employee?.email ?? "",
    username: employee?.username ?? "",
    role_id: employee?.role_id ?? roles[0]?.id ?? "",
    password: "",
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-md">
      <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">
        {isEditing ? "Employee profile" : "New team member"}
      </p>
      <h2 className="mt-1 text-xl font-semibold">
        {isEditing ? `Edit ${employee.first_name}` : "Create employee"}
      </h2>
      <p className="mb-5 mt-1 text-sm text-text-secondary">
        {isEditing
          ? "Update staff details. The existing password will remain unchanged."
          : "Add login details and assign the employee's operating role."}
      </p>

      {rolesError && roles.length === 0 && (
        <div className="mb-4 rounded-lg border border-error/40 bg-error/10 p-3 text-sm text-error">
          <p>Roles could not be loaded: {rolesError}</p>
          <button
            type="button"
            onClick={() => void dispatch(fetchRoles())}
            className="mt-2 rounded-md border border-error/40 px-2.5 py-1.5 font-semibold"
          >
            Retry roles
          </button>
        </div>
      )}

      <Formik<FormValues>
        enableReinitialize
        initialValues={initialValues}
        validationSchema={employeeSchema(isEditing)}
        onSubmit={async (
          values,
          { resetForm, setStatus, setSubmitting }
        ) => {
          setStatus(null);

          const employeeValues = {
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim(),
            phone_number: values.phone_number.trim()
              ? Number(values.phone_number)
              : null,
            email: values.email.trim(),
            username: values.username.trim(),
            role_id: Number(values.role_id),
          };

          try {
            if (employee) {
              await dispatch(
                updateEmployee({ ...employeeValues, id: employee.id })
              ).unwrap();
            } else {
              await dispatch(
                addEmployee({ ...employeeValues, password: values.password })
              ).unwrap();
              resetForm();
            }

            closeForm();
          } catch (error: unknown) {
            setStatus(
              typeof error === "string"
                ? error
                : "Employee changes could not be saved"
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status }) => (
          <Form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="mb-1 block text-sm font-medium">
                  First name
                </label>
                <Field id="first_name" name="first_name" className={fieldClassName} />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className={errorClassName}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="mb-1 block text-sm font-medium">
                  Last name
                </label>
                <Field id="last_name" name="last_name" className={fieldClassName} />
                <ErrorMessage
                  name="last_name"
                  component="div"
                  className={errorClassName}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <Field id="email" type="email" name="email" className={fieldClassName} />
              <ErrorMessage name="email" component="div" className={errorClassName} />
            </div>

            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium">
                Username
              </label>
              <Field
                id="username"
                name="username"
                autoComplete="off"
                className={fieldClassName}
              />
              <ErrorMessage
                name="username"
                component="div"
                className={errorClassName}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone_number" className="mb-1 block text-sm font-medium">
                  Phone number
                </label>
                <Field
                  id="phone_number"
                  name="phone_number"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10 digits (optional)"
                  className={fieldClassName}
                />
                <ErrorMessage
                  name="phone_number"
                  component="div"
                  className={errorClassName}
                />
              </div>
              <div>
                <label htmlFor="role_id" className="mb-1 block text-sm font-medium">
                  Role
                </label>
                <Field
                  as="select"
                  id="role_id"
                  name="role_id"
                  disabled={rolesLoading || roles.length === 0}
                  className={fieldClassName}
                >
                  <option value="">
                    {rolesLoading ? "Loading roles…" : "Select a role"}
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="role_id"
                  component="div"
                  className={errorClassName}
                />
              </div>
            </div>

            {!isEditing && (
              <div>
                <label htmlFor="employee_password" className="mb-1 block text-sm font-medium">
                  Temporary password
                </label>
                <Field
                  id="employee_password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  className={fieldClassName}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className={errorClassName}
                />
              </div>
            )}

            {status && (
              <div
                role="alert"
                className="rounded-lg border border-error/40 bg-error/10 p-3 text-sm text-error"
              >
                {status}
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || roles.length === 0}
                className="accent-badge rounded-lg px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Saving…"
                  : isEditing
                    ? "Save employee"
                    : "Create employee"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-border bg-white/5 px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-white/10 hover:text-text-primary"
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
