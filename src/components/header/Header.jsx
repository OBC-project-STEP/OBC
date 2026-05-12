import { Link } from "react-router-dom";
import logo from "/src/assets/images/Mini-logo.svg";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

export default function Header() {
  const { user } = useAuth();

  return (
    <header>
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="OBC Logo" />
        </Link>
      </div>

      <nav>
        <Link to="/knowledge">База знань</Link>
        <Link to="/experts">Експерти</Link>
        <Link to="/about">Про нас</Link>
        <Link to="/contacts">Контакти</Link>
      </nav>

      {user ? (
        <Link to="/profile" className="login-btn">
          Мій профіль
        </Link>
      ) : (
        <div className="login-btn login-btn--dual" role="group" aria-label="Вхід та реєстрація">
          <Link to="/login" className="login-btn-part">
            Вхід
          </Link>
          <span className="login-btn-sep" aria-hidden="true">
            \
          </span>
          <Link to="/register" className="login-btn-part">
            Реєстрація
          </Link>
        </div>
      )}
    </header>
  );
}