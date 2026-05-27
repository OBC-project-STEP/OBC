import { useEffect, useMemo, useState } from "react";
import ArticlesCarousel from "./ArticlesCarousel";
import { fetchArticles } from "../../api/articles";
import { apiArticleToCardMeta } from "../../utils/articleMeta";
import { filterArticlesByQuery } from "../../utils/filterArticles";
import "./ArticlesSection.css";

export default function ArticlesSection({ searchQuery = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchArticles();
        const items = Array.isArray(res?.articles) ? res.articles : [];
        if (!alive) return;
        setArticles(items);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Не вдалося завантажити статті");
        setArticles([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const uiArticles = useMemo(() => {
    return articles.map((a) => {
      const meta = apiArticleToCardMeta(a);
      return {
        id: meta.id,
        slug: meta.slug,
        image: meta.image,
        badge: "Безкоштовно",
        title: meta.title,
        description: meta.description,
        body: a.body ?? "",
        primaryAction: "Прочитати",
        primaryHref: meta.readHref,
        secondaryAction: "Зберегти на потім",
      };
    });
  }, [articles]);

  const visibleArticles = useMemo(
    () => filterArticlesByQuery(uiArticles, searchQuery),
    [uiArticles, searchQuery]
  );

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <section className="articles-section">
      <h2 className="articles-title">Найкращі Пропозиції</h2>

      <div className={`articles-inner${!loading ? " articles-inner--ready" : ""}`}>
        {error ? <p style={{ margin: 0 }}>{error}</p> : null}
        {loading ? (
          <p style={{ margin: 0 }}>Завантаження…</p>
        ) : visibleArticles.length > 0 ? (
          <ArticlesCarousel articles={visibleArticles} />
        ) : hasSearch ? (
          <p className="articles-empty-search">За запитом «{searchQuery.trim()}» статей не знайдено.</p>
        ) : (
          <p style={{ margin: 0 }}>Статей поки немає.</p>
        )}
      </div>
    </section>
  );
}
