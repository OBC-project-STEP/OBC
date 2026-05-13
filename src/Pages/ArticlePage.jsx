import { useState } from "react";
import {
  useNavigate,
  useParams,
  Navigate,
  useLocation,
} from "react-router-dom";
import { saveArticleForLater } from "../api/savedArticles";
import { useAuth } from "../context/AuthContext";
import { getHomeArticleBySlug } from "../data/homeArticles";
import { articleDetails } from "../data/articleDetails";
import "./ArticlePage.css";

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveHint, setSaveHint] = useState("");

  const meta = slug ? getHomeArticleBySlug(slug) : null;
  const detail = slug ? articleDetails[slug] : null;

  const showSaveToProfile = !user || user.role === "user";

  const handleSaveToProfile = async () => {
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
        setSaveHint("Ця стаття вже у збережених — відкрийте «Мій профіль».");
      } else {
        setSaveHint("Збережено. Переглянути список можна в «Мій профіль».");
      }
    } catch (err) {
      setSaveHint(err.message || "Не вдалося зберегти");
    } finally {
      setSaveBusy(false);
    }
  };

  if (!slug || !meta || !detail) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="article-page">
      <div className="article-page-shell">
        <section
          className="article-page-hero"
          aria-labelledby="article-page-title"
        >
          <figure className="article-page-hero-media">
            <img src={meta.image} alt={meta.title} />
          </figure>
          <div className="article-page-hero-text">
            <h1 id="article-page-title" className="article-page-title">
              {meta.title}
            </h1>
            <div className="article-page-actions">
              <button
                type="button"
                className="article-page-back"
                onClick={() => navigate(-1)}
              >
                ← назад
              </button>
              {showSaveToProfile ? (
              <button
                type="button"
                className="article-page-save"
                onClick={handleSaveToProfile}
                disabled={saveBusy}
              >
                {saveBusy ? "збереження…" : "зберегти в профіль"}
              </button>
              ) : null}
            </div>
            {showSaveToProfile && saveHint ? (
              <p className="article-page-save-hint" role="status">
                {saveHint}
              </p>
            ) : null}
          </div>
        </section>

        <article className="article-page-body">
          <p>{detail.intro}</p>

          {detail.sections.map((section, idx) => (
            <section key={idx} className="article-page-section">
              <h2>{section.heading}</h2>
              {section.paragraph ? <p>{section.paragraph}</p> : null}
              {section.bullets?.length > 0 ? (
                <ul>
                  {section.bullets.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="article-page-conclusion">
            <h2 className="article-page-conclusion-title">
              <span className="article-page-conclusion-icon" aria-hidden="true">
                ✓
              </span>
              Висновок
            </h2>
            <p>{detail.conclusion}</p>
          </section>
        </article>
      </div>
    </div>
  );
}
