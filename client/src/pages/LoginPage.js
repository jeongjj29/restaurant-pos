import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { login } from "../features/auth/authSlice";
import { useDispatch } from "react-redux";

function LoginPage() {
  const dispatch = useDispatch();
  const [loginError, setLoginError] = useState(null); // State for error message

  const loginSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  });

  return (
    <div>
      <h2>Login</h2>
      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          dispatch(login(values))
            .unwrap()
            .then(() => {
              resetForm(); // Reset form on successful login
              setLoginError(null); // Clear any previous errors
            })
            .catch((err) => {
              setLoginError(err); // Set error to display
              console.error(err);
            })
            .finally(() => {
              setSubmitting(false); // Always stop submitting
            });
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
            {loginError && (
              <div style={{ color: "red" }}>{loginError}</div>
            )}{" "}
            {/* Display login error */}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default LoginPage;
