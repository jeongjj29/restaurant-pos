import { useRouteError, isRouteErrorResponse } from "react-router-dom";

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
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-3xl font-bold mb-4 text-red-500">Oops!</h1>
      <p className="text-lg mb-2 text-text-primary">
        Sorry, an unexpected error has occurred.
      </p>
      <p className="text-text-secondary italic">{errorMessage}</p>
    </div>
  );
}

export default ErrorPage;
