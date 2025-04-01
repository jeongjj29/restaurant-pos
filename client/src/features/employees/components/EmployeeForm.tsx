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
  email: string;
  username: string;
  role_id: number;
  password: string;
}

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
    email: employee?.email ?? "",
    username: employee?.username ?? "",
    role_id: employee?.role_id ?? 1,
    password: "",
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">
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
            {/* Form Fields... (no changes needed here) */}
            {/* ...same JSX as before */}
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default EmployeeForm;
