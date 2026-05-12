import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../components/auth/AuthLayout.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Помилка входу");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Вхід в ваш акаунт</h1>
      {error ? <p className="auth-error">{error}</p> : null}
      <form onSubmit={onSubmit}>
        <div className="auth-field">
          <input
            className="auth-input"
            type="email"
            autoComplete="email"
            placeholder="Ваш e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="auth-field">
          <input
            className="auth-input"
            type="password"
            autoComplete="current-password"
            placeholder="Ваш пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="auth-row">
          <Link className="auth-link" to="/password-recovery">
            Проблеми з входом?
          </Link>
          <button type="submit" className="auth-btn-primary" disabled={pending}>
            Увійти
          </button>
        </div>
      </form>
      <p className="auth-footer-text">Немаєте акаунта?</p>
      <div className="auth-footer-actions">
        <Link to="/register" className="auth-btn-primary" style={{ textDecoration: "none" }}>
          Зареєструватись
        </Link>
      </div>
    </div>
  );
}
