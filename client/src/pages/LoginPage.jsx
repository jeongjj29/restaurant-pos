import * as yup from "yup";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "@auth/authSlice";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null); // State for error message

  const loginSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            dispatch(login(values))
              .unwrap()
              .then(() => {
                resetForm(); // Reset form on successful login
                setLoginError(null); // Clear any previous errors
                navigate("/");
              })
              .catch((err) => {
                setLoginError("Invalid username or password"); // Set error message
                setSubmitting(false);
              });
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <Field
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <Field
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>

              {loginError && (
                <div className="text-red-600 text-sm text-center">
                  {loginError}
                </div>
              )}

              <div className="flex items-center justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 text-white font-bold rounded-md ${
                    isSubmitting
                      ? "bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default LoginPage;
