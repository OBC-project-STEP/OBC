import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPatch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./ProfilePage.css";

function initialsFromParts(name, surname, emailFallback) {
  const n = (name || "").trim();
  const s = (surname || "").trim();
  const parts = [n[0], s[0]].filter(Boolean);
  if (parts.length === 0) return (emailFallback || "?")[0].toUpperCase();
  return parts.join("").toUpperCase().slice(0, 2);
}

function displayNameFromParts(name, surname, emailFallback) {
  const n = (name || "").trim();
  const s = (surname || "").trim();
  if (n && s) return `${n} ${s}`;
  return n || s || emailFallback || "";
}

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(true);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshUser();
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setSurname(user.surname ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  const initials = useMemo(
    () => initialsFromParts(name, surname, user?.email),
    [name, surname, user?.email]
  );
  const headlineName = useMemo(
    () => displayNameFromParts(name, surname, user?.email),
    [name, surname, user?.email]
  );

  const handleReset = () => {
    if (!user) return;
    setName(user.name ?? "");
    setSurname(user.surname ?? "");
    setPhone(user.phone ?? "");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await apiPatch("/auth/me", {
        name: name.trim(),
        surname: surname.trim(),
        phone: phone.trim() || null,
      });
      await refreshUser();
      setSuccess("Зміни збережено.");
    } catch (err) {
      setError(err.message || "Не вдалося зберегти");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const roleLabel =
    user?.role === "superadmin" ? "Супер-адмін" : user?.role === "admin" ? "Адмін" : "Користувач";
  const canOpenAdmin = user?.role === "admin" || user?.role === "superadmin";

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="profile-header-text">
            <h1 className="profile-title">Мій профіль</h1>
            <p className="profile-name">{headlineName}</p>
            <p className="profile-role-line">
              <span className="profile-role-badge">{roleLabel}</span>
              {canOpenAdmin ? (
                <Link to="/admin" className="profile-admin-link">
                  Адмін-панель
                </Link>
              ) : null}
            </p>
            {syncing ? <p className="profile-sync">Оновлення даних…</p> : null}
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          {error ? (
            <div className="profile-alert profile-alert--error" role="alert">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="profile-alert profile-alert--ok" role="status">
              {success}
            </div>
          ) : null}

          <label className="profile-form-label">
            Email
            <input className="profile-input profile-input--readonly" type="email" value={user?.email ?? ""} readOnly />
            <span className="profile-hint">Email змінити не можна.</span>
          </label>

          <label className="profile-form-label">
            Ім&apos;я
            <input
              className="profile-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={1}
              autoComplete="given-name"
            />
          </label>

          <label className="profile-form-label">
            Прізвище
            <input
              className="profile-input"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              minLength={1}
              autoComplete="family-name"
            />
          </label>

          <label className="profile-form-label">
            Телефон
            <input
              className="profile-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Необов’язково"
              autoComplete="tel"
            />
          </label>

          <div className="profile-form-actions">
            <button type="submit" className="profile-btn profile-btn--primary" disabled={saving || syncing}>
              {saving ? "Збереження…" : "Зберегти зміни"}
            </button>
            <button type="button" className="profile-btn profile-btn--ghost" onClick={handleReset} disabled={saving}>
              Скинути
            </button>
          </div>
        </form>

        {user?.id != null ? (
          <p className="profile-meta">Обліковий запис №{user.id}</p>
        ) : null}

        <div className="profile-actions">
          <Link to="/" className="profile-btn profile-btn--ghost">
            На головну
          </Link>
          <button type="button" className="profile-btn profile-btn--danger" onClick={handleLogout}>
            Вийти з акаунта
          </button>
        </div>
      </div>
    </div>
  );
}
