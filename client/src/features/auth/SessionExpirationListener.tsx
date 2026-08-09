import { useEffect } from "react";

import { useAppDispatch } from "@app/hooks";
import { SESSION_EXPIRED_EVENT } from "@app/apiClient";
import { sessionExpired } from "./authSlice";

function SessionExpirationListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const expireSession = () => dispatch(sessionExpired());
    window.addEventListener(SESSION_EXPIRED_EVENT, expireSession);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expireSession);
  }, [dispatch]);

  return null;
}

export default SessionExpirationListener;
