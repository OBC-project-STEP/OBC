import { Navigate, useLocation } from "react-router-dom";
import { getStoredToken } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, refreshUser } = useAuth();
  const location = useLocation();
  const hasToken = Boolean(getStoredToken());

  if (loading) {
    return <div className="auth-loading">Завантаження…</div>;
  }

  if (!user) {
    if (hasToken) {
      return (
        <div className="auth-loading" style={{ padding: "2rem", textAlign: "center" }}>
          <p>Не вдалося підключитися до сервера.</p>
          <p style={{ marginTop: "0.5rem", opacity: 0.85 }}>
            Запустіть бекенд і натисніть «Спробувати знову» — збережені статті залишаться в акаунті.
          </p>
          <button
            type="button"
            className="profile-btn profile-btn--primary"
            style={{ marginTop: "1rem" }}
            onClick={() => refreshUser()}
          >
            Спробувати знову
          </button>
        </div>
      );
    }

    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
