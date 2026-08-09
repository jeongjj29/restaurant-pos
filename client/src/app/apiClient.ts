import axios from "axios";

export const SESSION_EXPIRED_EVENT = "restaurant-pos:session-expired";

// The deployed client and API share an origin. Authentication is carried only
// by HttpOnly cookies; Axios reads the separate CSRF cookie and mirrors it into
// the header expected by Flask-JWT-Extended.
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrf_access_token";
axios.defaults.xsrfHeaderName = "X-CSRF-TOKEN";
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

axios.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      const isAuthenticationAttempt =
        requestUrl.includes("/api/auth/login") ||
        requestUrl.includes("/api/auth/me");

      if (!isAuthenticationAttempt && typeof window !== "undefined") {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
