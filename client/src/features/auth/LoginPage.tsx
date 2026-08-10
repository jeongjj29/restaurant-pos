import * as yup from "yup";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "@auth/authSlice";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { LoginFormValues } from "./types";
import DemoNotice from "@components/DemoNotice";

const DEMO_CREDENTIALS: LoginFormValues = {
  username: "demo",
  password: "restaurant-demo",
};

const safeReturnPath = (state: unknown) => {
  if (!state || typeof state !== "object" || !("from" in state)) return "/";
  const from = (state as { from?: unknown }).from;
  return typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//")
    ? from
    : "/";
};

function LoginPage() {
  const dispatch = useAppDispatch();
  const authenticationError = useAppSelector((state) => state.auth.error);
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);

  const loginSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 py-4">
      <div className="w-full max-w-md">
        <DemoNotice />
      </div>
      <div className="glass-panel w-full max-w-md rounded-2xl p-8">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-text-secondary">
          Staff Access
        </p>
        <h2 className="mb-6 text-3xl font-semibold">Sign In</h2>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={async (
            values: LoginFormValues,
            { setSubmitting, resetForm }: FormikHelpers<LoginFormValues>
          ) => {
            setLoginError(null);

            try {
              await dispatch(login(values)).unwrap();
              resetForm();
              navigate(safeReturnPath(location.state));
            } catch (error: unknown) {
              setLoginError(
                typeof error === "string"
                  ? error
                  : "Unable to sign in. Please try again."
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, setValues }) => (
            <Form className="space-y-4">
              <div className="rounded-xl border border-accent/35 bg-accent/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                      Public demo account
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      Username <code className="text-text-primary">demo</code> ·
                      Password{" "}
                      <code className="text-text-primary">restaurant-demo</code>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void setValues(DEMO_CREDENTIALS, false);
                      setLoginError(null);
                    }}
                    className="rounded-lg border border-accent/50 px-3 py-2 text-sm font-semibold text-accent-soft transition-colors hover:bg-accent/15"
                  >
                    Fill demo credentials
                  </button>
                </div>
                <p className="mt-2 text-xs text-text-disabled">
                  This account can run order workflows but cannot manage users,
                  roles, menu items, or tables.
                </p>
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="mb-1 block text-sm font-medium text-text-secondary"
                >
                  Username
                </label>
                <Field
                  type="text"
                  id="username"
                  name="username"
                  autoComplete="username"
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
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-border bg-white/5 px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="mt-1 text-sm text-error"
                />
              </div>

              {(loginError || authenticationError) && (
                <div role="alert" className="text-sm text-center text-error">
                  {loginError || authenticationError}
                </div>
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
