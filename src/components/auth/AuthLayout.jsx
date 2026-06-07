import { Link, Outlet } from "react-router-dom";
import logo from "/src/assets/images/Mini-logo.svg";
import "./AuthLayout.css";

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-decoration" aria-hidden="true" />
      <div className="auth-inner">
        <Link to="/" className="auth-logo-link">
          <img src={logo} alt="OBC" className="auth-logo" />
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
