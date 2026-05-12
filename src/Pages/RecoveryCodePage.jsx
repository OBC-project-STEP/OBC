import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import "../components/auth/AuthLayout.css";

const RECOVERY_EMAIL_KEY = "obc_recovery_email";
const RECOVERY_JWT_KEY = "obc_password_reset_jwt";

export default function RecoveryCodePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(RECOVERY_EMAIL_KEY);
    if (!saved) {
      navigate("/password-recovery", { replace: true });
      return;
    }
    setEmail(saved);
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const data = await apiPost(
        "/auth/verify-recovery-code",
        { email, code: code.trim() },
        { useAuth: false }
      );
      sessionStorage.setItem(RECOVERY_JWT_KEY, data.reset_token);
      navigate("/password-recovery/new");
    } catch (err) {
      setError(err.message || "Невірний код");
    } finally {
      setPending(false);
    }
  };

  if (!email) return <div className="auth-loading">Завантаження…</div>;

  return (
    <div className="auth-card">
      <h1 className="auth-title">
        Вам був надіслан код для верифікації на email введіть його в поле нижче
      </h1>
      {error ? <p className="auth-error">{error}</p> : null}
      <p style={{ textAlign: "center", marginBottom: 16, color: "#444", fontSize: "0.9rem" }}>
        Email: <strong>{email}</strong>
      </p>
      <form onSubmit={onSubmit}>
        <div className="auth-field">
          <input
            className="auth-input"
            placeholder="Код з email"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoComplete="one-time-code"
          />
        </div>
        <div className="auth-footer-actions" style={{ marginTop: 8 }}>
          <button type="submit" className="auth-btn-primary" disabled={pending} style={{ width: "100%" }}>
            Відновити доступ
          </button>
        </div>
      </form>
      <div className="auth-back">
        <Link className="auth-link" to="/password-recovery">
          Назад
        </Link>
      </div>
    </div>
  );
}
