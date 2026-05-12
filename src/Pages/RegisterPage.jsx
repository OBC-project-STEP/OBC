import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../components/auth/AuthLayout.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [surname, setSurname] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
      await register({
        email: email.trim(),
        password,
        password_confirm: passwordConfirm,
        surname: surname.trim(),
        name: name.trim(),
        phone: phone.trim() || null,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Помилка реєстрації");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Реєстрація нового акаунта</h1>
      {error ? <p className="auth-error">{error}</p> : null}
      <form onSubmit={onSubmit}>
        <div className="auth-field">
          <input
            className="auth-input"
            placeholder="Прізвище"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </div>
        <div className="auth-field">
          <input
            className="auth-input"
            placeholder="Ім'я"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="auth-field">
          <input
            className="auth-input"
            type="tel"
            placeholder="Телефон (необов’язково)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
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
            Зареєструватись
          </button>
        </div>
      </form>
      <p className="auth-footer-text" style={{ marginTop: 28 }}>
        Вже маєте акаунт?
      </p>
      <div className="auth-footer-actions">
        <Link to="/login" className="auth-btn-primary" style={{ textDecoration: "none" }}>
          Увійти
        </Link>
      </div>
    </div>
  );
}
