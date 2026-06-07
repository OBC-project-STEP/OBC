import { getHomeArticleBySlug, getLegacySlugForDbId } from "../data/homeArticles";
import placeholderThumb from "../assets/images/Banner-background.png";

export function bodyPreview(body, maxLen = 140) {
  const t = String(body ?? "").trim();
  if (!t) return "";
  return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}

export function articleBadge(article) {
  return article?.is_paid ? "З підпискою" : "Безкоштовно";
}

export function apiArticleToCardMeta(article) {
  const id = String(article.id);
  const routeSlug = getLegacySlugForDbId(id) || id;
  const body = String(article.body ?? "");
  return {
    id,
    slug: routeSlug,
    title: article.title ?? "",
    description: bodyPreview(body) || "Відкрити статтю",
    image: article.image && article.image !== "placeholder" ? article.image : placeholderThumb,
    readHref: `/article/${encodeURIComponent(routeSlug)}`,
    isPaid: Boolean(article.is_paid),
    badge: articleBadge(article),
  };
}

export function buildArticleMetaMap(articles) {
  const map = Object.create(null);
  for (const article of articles) {
    const meta = apiArticleToCardMeta(article);
    map[meta.id] = meta;
    map[meta.slug] = meta;
  }
  return map;
}

export function resolveSavedArticleMeta(slug, apiMap) {
  const local = getHomeArticleBySlug(slug);
  if (local) {
    return {
      slug,
      title: local.title,
      description: local.description,
      image: local.image,
      readHref: local.primaryHref || `/article/${encodeURIComponent(slug)}`,
    };
  }

  const fromApi = apiMap?.[slug];
  if (fromApi) return fromApi;

  return {
    slug,
    title: slug,
    description: "",
    image: null,
    readHref: `/article/${encodeURIComponent(slug)}`,
  };
}
