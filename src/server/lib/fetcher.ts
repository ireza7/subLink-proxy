/**
 * Subscription Fetcher
 *
 * Fetches V2Ray subscription content from remote URLs
 * with proper error handling for Cloudflare Workers.
 */

export interface FetchResult {
  ok: boolean;
  content: string;
  headers: Record<string, string>;
  error?: string;
}

const USER_AGENTS = [
  "v2rayN/6.42",
  "ClashForAndroid/2.5.12",
  "V2RayNG/1.8.16",
];

export async function fetchSubscription(url: string): Promise<FetchResult> {
  try {
    const parsedUrl = new URL(url);

    // Only allow http/https
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return { ok: false, content: "", headers: {}, error: "Invalid protocol. Only HTTP/HTTPS allowed." };
    }

    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    const response = await fetch(url, {
      headers: {
        "User-Agent": ua,
        Accept: "*/*",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return {
        ok: false,
        content: "",
        headers: {},
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const content = await response.text();

    // Extract useful subscription headers
    const subHeaders: Record<string, string> = {};
    const headerKeys = [
      "subscription-userinfo",
      "content-disposition",
      "profile-update-interval",
      "profile-web-page-url",
      "content-type",
    ];

    for (const key of headerKeys) {
      const val = response.headers.get(key);
      if (val) subHeaders[key] = val;
    }

    return { ok: true, content, headers: subHeaders };
  } catch (err) {
    return {
      ok: false,
      content: "",
      headers: {},
      error: err instanceof Error ? err.message : "Unknown fetch error",
    };
  }
}

/**
 * Parse subscription-userinfo header
 * Format: upload=xxx; download=xxx; total=xxx; expire=xxx
 */
export interface SubInfo {
  upload: number;
  download: number;
  total: number;
  expire: number;
  used: number;
  remaining: number;
  expireDate: string;
}

export function parseSubInfo(header: string): SubInfo | null {
  try {
    const parts: Record<string, number> = {};
    for (const part of header.split(";")) {
      const [key, value] = part.trim().split("=");
      if (key && value) parts[key.trim()] = Number(value.trim());
    }

    const upload = parts.upload || 0;
    const download = parts.download || 0;
    const total = parts.total || 0;
    const expire = parts.expire || 0;
    const used = upload + download;
    const remaining = Math.max(0, total - used);
    const expireDate = expire > 0 ? new Date(expire * 1000).toISOString() : "N/A";

    return { upload, download, total, expire, used, remaining, expireDate };
  } catch {
    return null;
  }
}
