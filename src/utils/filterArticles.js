/** Фільтр статей за текстом пошуку (назва + опис + тіло) */
export function filterArticlesByQuery(articles, query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return articles;

  return articles.filter((article) => {
    const title = String(article.title ?? "").toLowerCase();
    const description = String(article.description ?? "").toLowerCase();
    const body = String(article.body ?? "").toLowerCase();
    return title.includes(q) || description.includes(q) || body.includes(q);
  });
}
