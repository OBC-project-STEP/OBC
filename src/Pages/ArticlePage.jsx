import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
  Navigate,
  useLocation,
} from "react-router-dom";
import { saveArticleForLater } from "../api/savedArticles";
import { fetchArticleById } from "../api/articles";
import { fetchSubscription, hasArticleAccess } from "../api/subscription";
import PaywallModal from "../components/articles/PaywallModal";
import { useAuth } from "../context/AuthContext";
import { getHomeArticleBySlug, getLegacySlugForDbId } from "../data/homeArticles";
import { articleDetails } from "../data/articleDetails";
import { splitArticleBody } from "../utils/articleBody";
import placeholderThumb from "../assets/images/Banner-background.png";
import "./ArticlePage.css";

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveHint, setSaveHint] = useState("");
  const [remote, setRemote] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const legacySlug = slug ? getLegacySlugForDbId(slug) : null;
  const contentSlug = legacySlug || slug;

  const localMeta = contentSlug ? getHomeArticleBySlug(contentSlug) : null;
  const localDetail = contentSlug ? articleDetails[contentSlug] : null;
  const hasLocalContent = Boolean(localMeta && localDetail);

  useEffect(() => {
    let alive = true;
    if (!slug) return undefined;

    const apiId = legacySlug ? slug : slug;
    (async () => {
      setRemoteLoading(true);
      setLoadError("");
      try {
        const res = await fetchArticleById(apiId);
        if (!alive) return;
        setRemote(res?.article ?? null);
      } catch (e) {
        if (!alive) return;
        setRemote(null);
        if (!hasLocalContent) {
          setLoadError(e?.message || "Не вдалося завантажити статтю");
        }
      } finally {
        if (alive) setRemoteLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug, legacySlug, hasLocalContent]);

  useEffect(() => {
    if (!user || user.role !== "user") {
      setSubscription(null);
      return undefined;
    }

    let alive = true;
    (async () => {
      setSubscriptionLoading(true);
      try {
        const res = await fetchSubscription();
        if (alive) setSubscription(res);
      } catch {
        if (alive) setSubscription({ subscribed: false, purchased_slugs: [] });
      } finally {
        if (alive) setSubscriptionLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id, user?.role]);

  const remoteBody = String(remote?.body ?? "").trim();
  const useLocalContent = hasLocalContent && (!remote || !remoteBody);

  const title = useLocalContent
    ? localMeta.title
    : remote?.title || localMeta?.title || "";

  const heroImage = useMemo(() => {
    if (useLocalContent && localMeta?.image) return localMeta.image;
    if (remote?.image && remote.image !== "placeholder") return remote.image;
    if (localMeta?.image) return localMeta.image;
    return placeholderThumb;
  }, [useLocalContent, localMeta, remote]);

  const remoteParagraphs = useMemo(
    () => (remoteBody ? splitArticleBody(remoteBody) : []),
    [remoteBody]
  );

  const showSaveToProfile = !user || user.role === "user";
  const saveSlug = contentSlug || slug;
  const isPaid = Boolean(remote?.is_paid);
  const hasAccess = hasArticleAccess({
    isPaid,
    slug: saveSlug,
    user,
    subscription,
  });

  useEffect(() => {
    if (isPaid && !hasAccess && !subscriptionLoading) {
      setShowPaywall(true);
    } else {
      setShowPaywall(false);
    }
  }, [isPaid, hasAccess, subscriptionLoading]);

  const handleAccessGranted = (status) => {
    setSubscription(status);
    setShowPaywall(false);
    setSaveHint("Доступ відкрито.");
  };

  const handleSaveToProfile = async () => {
    setSaveHint("");
    if (!saveSlug) return;
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setSaveBusy(true);
    try {
      const res = await saveArticleForLater(saveSlug);
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

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  if (remoteLoading && !hasLocalContent) {
    return (
      <div className="article-page">
        <div className="article-page-shell">
          <p style={{ padding: "2rem", textAlign: "center" }}>Завантаження статті…</p>
        </div>
      </div>
    );
  }

  if (!remoteLoading && !remote && !hasLocalContent) {
    return (
      <div className="article-page">
        <div className="article-page-shell">
          <p style={{ padding: "2rem", textAlign: "center" }} role="alert">
            {loadError || "Статтю не знайдено"}
          </p>
          <p style={{ textAlign: "center" }}>
            <button type="button" className="article-page-back" onClick={() => navigate(-1)}>
              ← назад
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      <div className="article-page-shell">
        <section
          className="article-page-hero"
          aria-labelledby="article-page-title"
        >
          <figure className="article-page-hero-media">
            <img src={heroImage} alt={title || "Article"} />
          </figure>
          <div className="article-page-hero-text">
            <h1 id="article-page-title" className="article-page-title">
              {title}
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

        <div className={`article-page-body-wrap${!hasAccess && isPaid ? " article-page-body-wrap--locked" : ""}`}>
          <article
            className={`article-page-body${!hasAccess && isPaid ? " article-page-body--locked" : ""}`}
            aria-hidden={!hasAccess && isPaid ? "true" : undefined}
          >
            {useLocalContent ? (
              <>
                <p>{localDetail.intro}</p>

                {localDetail.sections.map((section, idx) => (
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
                  <p>{localDetail.conclusion}</p>
                </section>
              </>
            ) : remoteParagraphs.length > 0 ? (
              remoteParagraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p>Текст статті ще не додано.</p>
            )}
          </article>

          {!hasAccess && isPaid ? (
            <div className="article-page-paywall">
              <button
                type="button"
                className="article-page-paywall-cta"
                onClick={() => setShowPaywall(true)}
              >
                Отримати доступ
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {showPaywall && hasAccess === false && isPaid ? (
        <div
          className="article-page-paywall-overlay"
          role="presentation"
          onClick={() => setShowPaywall(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PaywallModal
              slug={saveSlug}
              onClose={() => setShowPaywall(false)}
              onAccessGranted={handleAccessGranted}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
