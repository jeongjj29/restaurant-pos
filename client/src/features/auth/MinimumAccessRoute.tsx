import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAppSelector } from "@app/hooks";
import { hasMinimumAccess } from "./access";

type MinimumAccessRouteProps = {
  children: ReactNode;
  minimumAccessLevel: number;
};

function MinimumAccessRoute({
  children,
  minimumAccessLevel,
}: MinimumAccessRouteProps) {
  const user = useAppSelector((state) => state.auth.user);

  if (!hasMinimumAccess(user, minimumAccessLevel)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default MinimumAccessRoute;
