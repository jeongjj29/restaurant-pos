import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";

function EmployeeForm() {
  const employeeSchema = yup.object().shape({
    first_name: yup.string().required("First name is required"),
    last_name: yup.string().required("Last name is required"),
    email: yup.string().required("Email is required"),
    username: yup.string().required("Username is required"),
    role_id: yup.integer().required("Role is required"),
    password: yup.string().required("Password is required"),
  });

  return (
    <div>
      <Formik></Formik>
    </div>
  );
}

export default EmployeeForm;
