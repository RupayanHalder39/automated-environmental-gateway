// Centralized API client for all frontend services.
// Keeping fetch logic here ensures consistent error handling and base URLs.

// DEV_MODE: when true, use the dev API base (if provided) to hit generated data flows.
const DEV_MODE = String(import.meta.env?.VITE_DEV_MODE || "").toLowerCase() === "true";
const API_BASE_URL =
  (DEV_MODE && import.meta.env?.VITE_DEV_API_BASE_URL) ||
  import.meta.env?.VITE_API_BASE_URL ||
  "http://localhost:3000/api/v1";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`GET ${path} failed with ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`POST ${path} failed with ${res.status}`);
  }
  return res.json();
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`PUT ${path} failed with ${res.status}`);
  }
  return res.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`PATCH ${path} failed with ${res.status}`);
  }
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`DELETE ${path} failed with ${res.status}`);
  }
  return res.json();
}

export async function apiGetBlob(path: string): Promise<{ blob: Blob; filename?: string }> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`GET ${path} failed with ${res.status}`);
  }
  const blob = await res.blob();
  const contentDisposition = res.headers.get("content-disposition") || "";
  const match = contentDisposition.match(/filename="([^"]+)"/i);
  const filename = match?.[1];
  return { blob, filename };
}
