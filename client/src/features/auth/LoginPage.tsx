import * as yup from "yup";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useNavigate } from "react-router-dom";
import { login } from "@auth/authSlice";
import { useAppDispatch } from "@app/hooks";
import { LoginFormValues } from "./types";

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const loginSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-text-secondary">
          Staff Access
        </p>
        <h2 className="mb-6 text-3xl font-semibold">Sign In</h2>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={(
            values: LoginFormValues,
            { setSubmitting, resetForm }: FormikHelpers<LoginFormValues>
          ) => {
            dispatch(login(values))
              .unwrap()
              .then(() => {
                resetForm();
                setLoginError(null);
                navigate("/");
              })
              .catch(() => {
                setLoginError("Invalid username or password");
                setSubmitting(false);
              });
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="mb-1 block text-sm font-medium text-text-secondary"
                >
                  Username
                </label>
                <Field
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  className="w-full rounded-lg border border-border bg-white/5 px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="mt-1 text-sm text-error"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-text-secondary"
                >
                  Password
                </label>
                <Field
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-border bg-white/5 px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="mt-1 text-sm text-error"
                />
              </div>

              {loginError && (
                <div className="text-sm text-center text-error">{loginError}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-lg bg-accent px-4 py-2.5 font-bold text-[#2a1703] transition-all duration-200 hover:bg-accent-soft ${
                  isSubmitting ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default LoginPage;
