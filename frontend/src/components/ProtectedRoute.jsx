import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Renders child routes only for logged-in users (and, optionally, specific roles).
export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="container page">
        <div className="alert alert-error">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  return <Outlet />;
}
