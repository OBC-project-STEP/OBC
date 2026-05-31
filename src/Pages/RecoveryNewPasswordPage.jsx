import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiPost, apiPostWithBearer } from "../api/client";
import "../components/auth/AuthLayout.css";

const RECOVERY_EMAIL_KEY = "obc_recovery_email";
const RECOVERY_JWT_KEY = "obc_password_reset_jwt";

export default function RecoveryNewPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const linkToken = params.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError("Паролі не збігаються");
      return;
    }
    setPending(true);
    try {
      if (linkToken) {
        await apiPost(
          "/auth/reset-password-with-link",
          { token: linkToken, password, password_confirm: passwordConfirm },
          { useAuth: false }
        );
      } else {
        const resetJwt = sessionStorage.getItem(RECOVERY_JWT_KEY);
        if (!resetJwt) {
          setError("Спочатку введіть код з email на попередньому кроці.");
          setPending(false);
          navigate("/password-recovery/code", { replace: true });
          return;
        }
        await apiPostWithBearer(
          "/auth/reset-password",
          { password, password_confirm: passwordConfirm },
          resetJwt
        );
      }
      sessionStorage.removeItem(RECOVERY_JWT_KEY);
      sessionStorage.removeItem(RECOVERY_EMAIL_KEY);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Помилка");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Створіть новий пароль</h1>
      {linkToken ? (
        <p style={{ textAlign: "center", marginBottom: 16, color: "#444", fontSize: "0.9rem" }}>
          Ви перейшли за посиланням з email.
        </p>
      ) : null}
      {error ? <p className="auth-error">{error}</p> : null}
      <form onSubmit={onSubmit}>
        <div className="auth-field">
          <input
            className="auth-input"
            type="password"
            autoComplete="new-password"
            placeholder="Ваш пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="auth-field">
          <input
            className="auth-input"
            type="password"
            autoComplete="new-password"
            placeholder="Повторіть ваш пароль"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength={6}
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
