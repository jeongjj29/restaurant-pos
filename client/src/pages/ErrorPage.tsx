import { NavLink, isRouteErrorResponse, useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();

  console.error(error);

  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = "An unknown error occurred";
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel max-w-lg rounded-2xl p-8 text-center">
        <h1 className="mb-3 text-4xl font-bold text-error">Route Error</h1>
        <p className="mb-2 text-lg text-text-primary">
          Sorry, something went wrong while loading this page.
        </p>
        <p className="mb-6 italic text-text-secondary">{errorMessage}</p>
        <NavLink
          to="/"
          className="accent-badge inline-block rounded-lg px-4 py-2.5 text-sm"
        >
          Back to Dashboard
        </NavLink>
      </div>
    </div>
  );
}

export default ErrorPage;
