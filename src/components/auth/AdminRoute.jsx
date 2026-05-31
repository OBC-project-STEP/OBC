import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading" style={{ padding: 48, textAlign: "center", fontFamily: "Inter, sans-serif" }}>
        Завантаження…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = String(user?.role || "user").toLowerCase();
  if (role !== "admin" && role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
