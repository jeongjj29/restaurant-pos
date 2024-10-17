import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    navigate("/login");
  }

  return children;
}

export default ProtectedRoute;
