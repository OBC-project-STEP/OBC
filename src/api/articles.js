import { apiGet } from "./client";

export async function fetchArticles() {
  return apiGet("/articles", { useAuth: false });
}

export async function fetchArticleById(id) {
  return apiGet(`/articles/${encodeURIComponent(id)}`, { useAuth: false });
}

