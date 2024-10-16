import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { login } from "../features/auth/authService";

function LoginPage() {
  const loginSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  });

  return (
    <div>
      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          login(values.username, values.password);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <label htmlFor="username">Username:</label>
            <Field type="text" name="username" placeholder="Username" />
            <ErrorMessage name="username" component="div" />

            <label htmlFor="password">Password:</label>
            <Field type="password" name="password" placeholder="Password" />
            <ErrorMessage name="password" component="div" />

            <button type="submit" disabled={isSubmitting}>
              Login
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default LoginPage;
