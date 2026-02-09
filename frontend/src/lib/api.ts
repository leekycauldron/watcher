const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function getStreamStatus() {
  return request<import("./types").StreamStatus>("/stream/status");
}

export function getSystemHealth() {
  return request<import("./types").SystemHealth>("/system/health");
}

export function getConfig() {
  return request<import("./types").ConfigResponse>("/config");
}

export function updateConfig(key: string, value: string) {
  return request<{ key: string; value: string; updated: boolean }>(
    `/config/${key}`,
    { method: "PUT", body: JSON.stringify({ value }) },
  );
}
