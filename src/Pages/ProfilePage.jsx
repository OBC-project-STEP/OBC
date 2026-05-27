import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPatch } from "../api/client";
import { fetchArticles } from "../api/articles";
import { fetchSavedArticles, removeSavedArticle } from "../api/savedArticles";
import { useAuth } from "../context/AuthContext";
import { buildArticleMetaMap, resolveSavedArticleMeta } from "../utils/articleMeta";
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
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedArticles, setSavedArticles] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState("");
  const [articleMetaMap, setArticleMetaMap] = useState({});
  const [planModal, setPlanModal] = useState(null);
  const [planNotice, setPlanNotice] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setSurname(user.surname ?? "");
    setPhone(user.phone ?? "");
  }, [user?.id, user?.name, user?.surname, user?.phone]);

  useEffect(() => {
    if (!user) {
      setSavedArticles([]);
      setArticleMetaMap({});
      return;
    }

    if (user.role !== "user") {
      setSavedArticles([]);
      setArticleMetaMap({});
      return;
    }

    let cancelled = false;
    (async () => {
      setSavedLoading(true);
      setSavedError("");
      try {
        const [savedData, articlesData] = await Promise.all([
          fetchSavedArticles(),
          fetchArticles(),
        ]);
        if (cancelled) return;
        setSavedArticles(savedData.articles ?? []);
        setArticleMetaMap(buildArticleMetaMap(articlesData.articles ?? []));
      } catch (e) {
        if (!cancelled) setSavedError(e.message || "Не вдалося завантажити збережені статті");
      } finally {
        if (!cancelled) setSavedLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  const handleRemoveSaved = async (slug) => {
    setSavedError("");
    try {
      await removeSavedArticle(slug);
      setSavedArticles((prev) => prev.filter((a) => a.slug !== slug));
    } catch (e) {
      setSavedError(e.message || "Не вдалося прибрати зі списку");
    }
  };

  const initials = useMemo(
    () => initialsFromParts(name, surname, user?.email),
    [name, surname, user?.email]
  );
  const headlineName = useMemo(
    () => displayNameFromParts(name, surname, user?.email),
    [name, surname, user?.email]
  );

  /** Збережені статті — лише для звичайного користувача (не admin / superadmin) */
  const isRegularUser = user?.role === "user";

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
      await refreshUser({ silent: true });
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

  const closePlanModal = () => setPlanModal(null);

  const handleConfirmUnsubscribe = () => {
    setPlanModal(null);
    setPlanNotice("Підписку скасовано.");
  };

  const handlePauseSubscription = (months) => {
    setPlanModal(null);
    setPlanNotice(`Підписку поставлено на паузу на ${months} міс.`);
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
              placeholder="Необов'язково"
              autoComplete="tel"
            />
          </label>

          <div className="profile-form-actions">
            <button type="submit" className="profile-btn profile-btn--primary" disabled={saving}>
              {saving ? "Збереження…" : "Зберегти зміни"}
            </button>
            <button type="button" className="profile-btn profile-btn--ghost" onClick={handleReset} disabled={saving}>
              Скинути
            </button>
          </div>
        </form>
      </div>

      {isRegularUser ? (
        <section className="profile-saved-outer" aria-labelledby="profile-saved-heading">
          <h2 id="profile-saved-heading" className="profile-saved-outer-title">
            Список статей
          </h2>

          <div className="profile-saved-panel">
            {savedLoading ? (
              <p className="profile-saved-panel-hint">Завантаження…</p>
            ) : null}
            {savedError ? (
              <div className="profile-alert profile-alert--error" role="alert">
                {savedError}
              </div>
            ) : null}

            {!savedLoading && savedArticles.length === 0 ? (
              <p className="profile-saved-panel-empty">
                Поки немає збережених матеріалів. На головній або в базі знань натисніть «Зберегти на потім» біля статті —
                вона з'явиться тут.
              </p>
            ) : null}

            {savedArticles.length > 0 ? (
              <div className="profile-saved-grid">
                {savedArticles.map((row) => {
                  const meta = resolveSavedArticleMeta(row.slug, articleMetaMap);
                  const title = meta.title;
                  const preview = meta.description;
                  return (
                    <article key={row.slug} className="profile-saved-card">
                      <div className="profile-saved-card-image-wrap">
                        {meta.image ? (
                          <img src={meta.image} alt={title} className="profile-saved-card-img" />
                        ) : (
                          <div className="profile-saved-card-img profile-saved-card-img--placeholder" />
                        )}
                      </div>
                      <p className="profile-saved-card-text">{preview || title}</p>
                      <div className="profile-saved-card-actions">
                        <span
                          className="profile-saved-card-link profile-saved-card-link--disabled"
                          title="Вже збережено у профілі"
                        >
                          Зберегти
                        </span>
                        <Link className="profile-saved-card-link" to={meta.readHref}>
                          Читати
                        </Link>
                        <button
                          type="button"
                          className="profile-saved-card-link profile-saved-card-link--danger"
                          onClick={() => handleRemoveSaved(row.slug)}
                        >
                          Видалити
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="profile-plan-panel" aria-labelledby="profile-plan-heading">
            <p className="profile-plan-label">Ваш план:</p>
            <h2 id="profile-plan-heading" className="profile-plan-title">
              Premium access - XX USD/monthly
            </h2>
            <p className="profile-plan-desc">
              Цей план надає доступ до ексклюзивних статей, доступ до чату 24/7 з кваліфікованими
              експертами та індивідуальні консультації з конкретними кейсами
            </p>

            {planNotice ? (
              <p className="profile-plan-notice" role="status">
                {planNotice}
              </p>
            ) : null}

            <div className="profile-plan-payment">
              <span className="profile-plan-payment-label">Платіжні дані</span>
              <input
                className="profile-plan-card-input"
                type="text"
                value="123456XXXXXX7890"
                readOnly
                aria-label="Маскований номер картки"
              />
              <button type="button" className="profile-plan-change-btn">
                Змінити план
              </button>
            </div>

            <div className="profile-plan-actions">
              <button
                type="button"
                className="profile-plan-btn profile-plan-btn--cancel"
                onClick={() => setPlanModal("unsub")}
              >
                Відписатись
              </button>
              <button
                type="button"
                className="profile-plan-btn profile-plan-btn--pause"
                onClick={() => setPlanModal("pause")}
              >
                Поставити на паузу
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {planModal === "unsub" ? (
        <div className="profile-plan-modal-overlay" role="presentation" onClick={closePlanModal}>
          <div
            className="profile-plan-modal"
            role="dialog"
            aria-labelledby="profile-unsub-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="profile-plan-modal-close"
              aria-label="Закрити"
              onClick={closePlanModal}
            >
              ×
            </button>
            <h3 id="profile-unsub-modal-title" className="profile-plan-modal-title">
              Можливо, поставити підписку на паузу?
            </h3>
            <p className="profile-plan-modal-text">
              Якщо зараз сервіс вам тимчасово не потрібен, ви можете поставити підписку на паузу.
            </p>
            <p className="profile-plan-modal-text">
              Ваші дані, історія та налаштування збережуться, і ви зможете повернутися у будь-який
              момент.
            </p>
            <div className="profile-plan-modal-actions profile-plan-modal-actions--stack">
              <button
                type="button"
                className="profile-plan-modal-btn profile-plan-modal-btn--pause"
                onClick={() => setPlanModal("pause")}
              >
                Поставити на паузу
              </button>
              <button
                type="button"
                className="profile-plan-modal-btn profile-plan-modal-btn--cancel"
                onClick={handleConfirmUnsubscribe}
              >
                Відписатись
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {planModal === "pause" ? (
        <div className="profile-plan-modal-overlay" role="presentation" onClick={closePlanModal}>
          <div
            className="profile-plan-modal"
            role="dialog"
            aria-labelledby="profile-pause-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="profile-plan-modal-close"
              aria-label="Закрити"
              onClick={closePlanModal}
            >
              ×
            </button>
            <h3 id="profile-pause-modal-title" className="profile-plan-modal-title">
              Поставити підписку на паузу
            </h3>
            <p className="profile-plan-modal-text">
              Оберіть, на який час ви хочете призупинити підписку.
            </p>
            <div className="profile-plan-modal-duration">
              <button
                type="button"
                className="profile-plan-duration-btn"
                onClick={() => handlePauseSubscription(3)}
              >
                3 місяці
              </button>
              <button
                type="button"
                className="profile-plan-duration-btn"
                onClick={() => handlePauseSubscription(6)}
              >
                6 місяців
              </button>
              <button
                type="button"
                className="profile-plan-duration-btn"
                onClick={() => handlePauseSubscription(12)}
              >
                12 місяців
              </button>
            </div>
            <p className="profile-plan-modal-footnote">
              У цей період доступ до сервісу буде тимчасово обмежений, але ваші дані та історія
              залишаться збереженими.
            </p>
          </div>
        </div>
      ) : null}

      <div className="profile-card profile-card--tail">
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
