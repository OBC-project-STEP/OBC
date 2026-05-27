/** Розбити текст статті на абзаци для відображення */
export function splitArticleBody(body) {
  const t = String(body ?? "").trim();
  if (!t) return [];
  if (/\n{2,}/.test(t)) {
    return t.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  }
  return t.split(/\n/).map((p) => p.trim()).filter(Boolean);
}
