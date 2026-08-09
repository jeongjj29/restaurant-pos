import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { restoreSession } from "./authSlice";

type ProtectedRouteProps = {
  children: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { initialized, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const requestedSession = useRef(false);

  useEffect(() => {
    if (!initialized && !requestedSession.current) {
      requestedSession.current = true;
      void dispatch(restoreSession());
    }
  }, [dispatch, initialized]);

  if (!initialized) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center text-text-secondary"
      >
        Restoring your session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
