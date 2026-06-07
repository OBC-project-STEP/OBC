import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import "../components/auth/AuthLayout.css";

const RECOVERY_EMAIL_KEY = "obc_recovery_email";

export default function RecoveryEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await apiPost("/auth/forgot-password", { email: email.trim() }, { useAuth: false });
      sessionStorage.setItem(RECOVERY_EMAIL_KEY, email.trim());
      navigate("/password-recovery/code");
    } catch (err) {
      setError(err.message || "Помилка");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Проблеми зі входом?</h1>
      {error ? <p className="auth-error">{error}</p> : null}
      <form onSubmit={onSubmit}>
        <div className="auth-field">
          <input
            className="auth-input"
            type="email"
            placeholder="Ваш e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="auth-footer-actions" style={{ marginTop: 8 }}>
          <button type="submit" className="auth-btn-primary" disabled={pending} style={{ width: "100%" }}>
            Відновити доступ
          </button>
        </div>
      </form>
      <div className="auth-back">
        <Link className="auth-link" to="/login">
          Назад до входу
        </Link>
      </div>
    </div>
  );
}
