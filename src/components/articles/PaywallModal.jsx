import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { purchaseArticle, subscribe } from "../../api/subscription";
import { useAuth } from "../../context/AuthContext";
import "./PaywallModal.css";

export default function PaywallModal({
  slug,
  onAccessGranted,
  compact = false,
  onClose,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const requireLogin = () => {
    navigate("/login", { state: { from: location } });
  };

  const handleSubscribe = async () => {
    if (!user) {
      requireLogin();
      return;
    }
    setError("");
    setBusy("subscribe");
    try {
      const res = await subscribe();
      onAccessGranted?.(res);
    } catch (e) {
      setError(e.message || "Не вдалося оформити підписку");
    } finally {
      setBusy(null);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      requireLogin();
      return;
    }
    if (!slug) return;
    setError("");
    setBusy("purchase");
    try {
      const res = await purchaseArticle(slug);
      onAccessGranted?.(res);
    } catch (e) {
      setError(e.message || "Не вдалося придбати статтю");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={`paywall-modal${compact ? " paywall-modal--compact" : ""}`}>
      {onClose ? (
        <button type="button" className="paywall-modal__close" aria-label="Закрити" onClick={onClose}>
          ×
        </button>
      ) : null}
      <p className="paywall-modal__eyebrow">Платний матеріал</p>
      <h2 className="paywall-modal__title">Отримайте доступ до цієї статті</h2>
      <p className="paywall-modal__text">
        Оформіть підписку на всю Базу Знань або придбайте лише цю статтю.
      </p>

      {error ? (
        <p className="paywall-modal__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="paywall-modal__options">
        <button
          type="button"
          className="paywall-modal__option paywall-modal__option--primary"
          onClick={handleSubscribe}
          disabled={busy != null}
        >
          <span className="paywall-modal__price">$39 / міс</span>
          <span className="paywall-modal__option-title">Безлімітний доступ</span>
          <span className="paywall-modal__option-desc">
            Усі статті, шаблони та відеоінструкції Бази Знань
          </span>
          {busy === "subscribe" ? "Оформлення…" : "Підписатися"}
        </button>

        <button
          type="button"
          className="paywall-modal__option"
          onClick={handlePurchase}
          disabled={busy != null || !slug}
        >
          <span className="paywall-modal__price">$9</span>
          <span className="paywall-modal__option-title">Лише ця стаття</span>
          <span className="paywall-modal__option-desc">
            Стаття з&apos;явиться у вашому профілі
          </span>
          {busy === "purchase" ? "Оплата…" : "Придбати статтю"}
        </button>
      </div>

      <p className="paywall-modal__footnote">
        Оплата імітується для демо. Керувати підпискою можна в{" "}
        <Link to="/profile">профілі</Link>.
      </p>
    </div>
  );
}
