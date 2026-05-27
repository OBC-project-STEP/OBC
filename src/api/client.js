const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

function formatDetail(detail) {
  if (detail == null) return "Помилка запиту";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => e.msg ?? JSON.stringify(e)).join(", ");
  }
  return String(detail);
}

async function parseResponse(res) {
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }
  }
  if (!res.ok) {
    const err = new Error(formatDetail(data?.detail) || res.statusText);
    err.status = res.status;
    throw err;
  }
  return data;
}

function isNetworkError(err) {
  return err instanceof TypeError || err?.name === "TypeError";
}

export function getStoredToken() {
  return localStorage.getItem("obc_access_token");
}

export function setStoredToken(token) {
  if (token) localStorage.setItem("obc_access_token", token);
  else localStorage.removeItem("obc_access_token");
}

export async function apiGet(path, { useAuth = true } = {}) {
  const headers = {};
  if (useAuth) {
    const auth = getStoredToken();
    if (auth) headers.Authorization = `Bearer ${auth}`;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, { method: "GET", headers });
    return parseResponse(res);
  } catch (err) {
    if (isNetworkError(err)) {
      const netErr = new Error("Немає з’єднання з сервером");
      netErr.isNetworkError = true;
      throw netErr;
    }
    throw err;
  }
}

export async function apiPost(path, body, { useAuth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (useAuth) {
    const auth = getStoredToken();
    if (auth) headers.Authorization = `Bearer ${auth}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

export async function apiPatch(path, body, { useAuth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (useAuth) {
    const auth = getStoredToken();
    if (auth) headers.Authorization = `Bearer ${auth}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

export async function apiDelete(path, { useAuth = true } = {}) {
  const headers = {};
  if (useAuth) {
    const auth = getStoredToken();
    if (auth) headers.Authorization = `Bearer ${auth}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE", headers });
  return parseResponse(res);
}

export async function apiPostWithBearer(path, body, bearer) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}
