import { useNavigate } from "react-router-dom";
import { getToken } from "./authService";

function ProtectedRoute({ children }) {
  const token = getToken();
  const navigate = useNavigate();

  return token ? children : navigate("/login");
}

export default ProtectedRoute;
