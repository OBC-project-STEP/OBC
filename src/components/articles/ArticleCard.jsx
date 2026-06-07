import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { saveArticleForLater } from "../../api/savedArticles";
import { useAuth } from "../../context/AuthContext";
import "./ArticleCard.css";

function badgeVariantFromLabel(text) {
  const t = String(text).toLowerCase();
  if (t.includes("безкоштовно")) return "green";
  if (t.includes("підписк")) return "blue";
  if (t.includes("знижка")) return "red";
  if (t.includes("доступно")) return "yellow";
  return "blue";
}

export default function ArticleCard({ data }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveHint, setSaveHint] = useState("");

  const badges =
    data.badges?.length > 0
      ? data.badges
      : data.badge
        ? [{ text: data.badge, variant: badgeVariantFromLabel(data.badge) }]
        : [];

  const slug = data.slug;

  /** Збереження «на потім» — лише для гостя (веде на логін) або звичайного user */
  const showSaveForLater = !user || user.role === "user";

  const handleSaveForLater = async () => {
    setSaveHint("");
    if (!slug) return;
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setSaveBusy(true);
    try {
      const res = await saveArticleForLater(slug);
      if (res?.was_new === false) {
        setSaveHint("Вже у збережених — див. профіль.");
      } else {
        setSaveHint("Збережено. Відкрийте «Мій профіль».");
      }
      window.setTimeout(() => setSaveHint(""), 5000);
    } catch (err) {
      setSaveHint(err.message || "Не вдалося зберегти");
    } finally {
      setSaveBusy(false);
    }
  };

  return (
    <div className="article-card">
      <div className="article-image">
        <div className="article-badges">
          {badges.map((b, idx) => (
            <span key={idx} className={`article-badge ${b.variant}`}>
              {b.text}
            </span>
          ))}
        </div>

        <img src={data.image} alt={data.title} />
      </div>

      <div className="article-content">
        <h3>{data.title}</h3>
        <p>{data.description}</p>
      </div>

      <div className="article-actions">
        {data.primaryHref ? (
          <Link to={data.primaryHref}>{data.primaryAction}</Link>
        ) : (
          <a href="#">{data.primaryAction}</a>
        )}
        {slug ? (
          showSaveForLater ? (
          <button
            type="button"
            className="article-actions-linklike"
            onClick={handleSaveForLater}
            disabled={saveBusy}
          >
            {saveBusy ? "…" : data.secondaryAction}
          </button>
          ) : null
        ) : (
          <span className="article-actions-muted">{data.secondaryAction}</span>
        )}
      </div>
      {saveHint ? <p className="article-save-hint">{saveHint}</p> : null}
    </div>
  );
}
