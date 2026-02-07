/**
 * API Client for V2Sub Worker
 */

const API_BASE = "/api";

export interface SubConfig {
  protocol: string;
  name: string;
  address: string;
  port: number;
  id?: string;
  security?: string;
  network?: string;
  tls?: string;
  sni?: string;
  method?: string;
  [key: string]: unknown;
}

export interface SubResponse {
  count: number;
  subInfo: SubInfo | null;
  headers: Record<string, string>;
  configs: SubConfig[];
}

export interface SubInfo {
  upload: number;
  download: number;
  total: number;
  expire: number;
  used: number;
  remaining: number;
  expireDate: string;
}

export async function fetchSub(
  url: string,
  format: string = "json"
): Promise<SubResponse | string> {
  const res = await fetch(
    `${API_BASE}/sub?url=${encodeURIComponent(url)}&format=${format}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error: string }).error || `HTTP ${res.status}`);
  }
  if (format === "json") {
    return res.json() as Promise<SubResponse>;
  }
  return res.text();
}

export async function parseConfigs(text: string): Promise<{
  count: number;
  configs: SubConfig[];
}> {
  const res = await fetch(`${API_BASE}/sub/parse`, {
    method: "POST",
    body: text,
  });
  if (!res.ok) throw new Error("Failed to parse configs");
  return res.json();
}

export async function convertConfigs(
  configs: string,
  format: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/sub/convert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ configs, format }),
  });
  if (!res.ok) throw new Error("Failed to convert configs");
  return res.text();
}

export async function decodeBase64(text: string): Promise<string> {
  const res = await fetch(`${API_BASE}/tools/decode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to decode");
  const data = (await res.json()) as { result: string };
  return data.result;
}

export async function encodeBase64(text: string): Promise<string> {
  const res = await fetch(`${API_BASE}/tools/encode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to encode");
  const data = (await res.json()) as { result: string };
  return data.result;
}

export async function parseUri(uri: string): Promise<SubConfig> {
  const res = await fetch(`${API_BASE}/tools/parse-uri`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uri }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown" }));
    throw new Error((err as { error: string }).error);
  }
  const data = (await res.json()) as { config: SubConfig };
  return data.config;
}
