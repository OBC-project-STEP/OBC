import { apiDelete, apiGet, apiPost } from "./client";

export async function fetchSavedArticles() {
  return apiGet("/auth/me/saved-articles");
}

export async function saveArticleForLater(slug) {
  return apiPost("/auth/me/saved-articles", { slug });
}

export async function removeSavedArticle(slug) {
  return apiDelete(`/auth/me/saved-articles/${encodeURIComponent(slug)}`);
}
