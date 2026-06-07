import { apiDelete, apiGet, apiPost } from "./client";

export async function fetchSubscription() {
  return apiGet("/auth/me/subscription");
}

export async function subscribe() {
  return apiPost("/auth/me/subscription", {});
}

export async function unsubscribe() {
  return apiDelete("/auth/me/subscription");
}

export async function purchaseArticle(slug) {
  return apiPost("/auth/me/purchase-article", { slug });
}

export function hasArticleAccess({ isPaid, slug, user, subscription }) {
  if (!isPaid) return true;
  if (user?.role === "admin" || user?.role === "superadmin") return true;
  if (!user || user.role !== "user" || !subscription) return false;
  if (subscription.subscribed) return true;
  return Array.isArray(subscription.purchased_slugs)
    && subscription.purchased_slugs.includes(slug);
}
