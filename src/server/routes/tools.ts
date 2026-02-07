/**
 * Tools API Routes
 *
 * Various V2Ray utility endpoints:
 *
 * POST /api/tools/decode    - Decode base64 content
 * POST /api/tools/encode    - Encode content to base64
 * POST /api/tools/parse-uri - Parse a single V2Ray URI
 * POST /api/tools/info      - Get subscription info from URL
 * POST /api/tools/merge     - Merge multiple subscription URLs
 * POST /api/tools/clean     - Remove duplicates & invalid configs
 */

import { Hono } from "hono";
import { parseConfig, parseSubscription } from "../lib/parser";
import { fetchSubscription, parseSubInfo } from "../lib/fetcher";
import { toBase64Sub } from "../lib/converter";

const tools = new Hono();

// ─── Base64 Decode ───────────────────────────────────────────

tools.post("/decode", async (c) => {
  const { text } = await c.req.json<{ text: string }>();
  if (!text) return c.json({ error: "Missing 'text'" }, 400);

  try {
    let s = text.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4 !== 0) s += "=";
    const decoded = atob(s);
    return c.json({ result: decoded });
  } catch {
    return c.json({ error: "Invalid base64 input" }, 400);
  }
});

// ─── Base64 Encode ───────────────────────────────────────────

tools.post("/encode", async (c) => {
  const { text } = await c.req.json<{ text: string }>();
  if (!text) return c.json({ error: "Missing 'text'" }, 400);

  try {
    const encoded = btoa(text);
    return c.json({ result: encoded });
  } catch {
    return c.json({ error: "Failed to encode" }, 400);
  }
});

// ─── Parse Single URI ────────────────────────────────────────

tools.post("/parse-uri", async (c) => {
  const { uri } = await c.req.json<{ uri: string }>();
  if (!uri) return c.json({ error: "Missing 'uri'" }, 400);

  const config = parseConfig(uri);
  if (!config) {
    return c.json(
      {
        error:
          "Failed to parse URI. Unsupported protocol or invalid format.",
      },
      400
    );
  }

  const { raw, ...rest } = config;
  return c.json({ config: rest });
});

// ─── Subscription Info ───────────────────────────────────────

tools.post("/info", async (c) => {
  const { url } = await c.req.json<{ url: string }>();
  if (!url) return c.json({ error: "Missing 'url'" }, 400);

  try {
    new URL(url);
  } catch {
    return c.json({ error: "Invalid URL" }, 400);
  }

  const result = await fetchSubscription(url);
  if (!result.ok) {
    return c.json(
      { error: "Failed to fetch", details: result.error },
      502
    );
  }

  const subInfo = result.headers["subscription-userinfo"]
    ? parseSubInfo(result.headers["subscription-userinfo"])
    : null;

  return c.json({
    subInfo,
    headers: result.headers,
    contentLength: result.content.length,
    configCount: result.content.split("\n").filter((l) => l.trim()).length,
  });
});

// ─── Merge Multiple Subscriptions ────────────────────────────

tools.post("/merge", async (c) => {
  const { urls, removeDuplicates } = await c.req.json<{
    urls: string[];
    removeDuplicates?: boolean;
  }>();

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return c.json({ error: "Missing or empty 'urls' array" }, 400);
  }

  if (urls.length > 10) {
    return c.json({ error: "Maximum 10 URLs allowed" }, 400);
  }

  const allConfigs: Array<{
    protocol: string;
    name: string;
    address: string;
    port: number;
    raw: string;
    [key: string]: unknown;
  }> = [];
  const errors: string[] = [];

  // Fetch all subscriptions in parallel
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL: ${url}`);
      }
      return fetchSubscription(url);
    })
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "rejected") {
      errors.push(`URL ${i + 1}: ${result.reason}`);
      continue;
    }
    if (!result.value.ok) {
      errors.push(`URL ${i + 1}: ${result.value.error}`);
      continue;
    }
    const configs = parseSubscription(result.value.content);
    allConfigs.push(...configs);
  }

  let finalConfigs = allConfigs;

  // Remove duplicates by address:port:protocol
  if (removeDuplicates !== false) {
    const seen = new Set<string>();
    finalConfigs = allConfigs.filter((c) => {
      const key = `${c.protocol}:${c.address}:${c.port}:${c.id || c.password || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Return merged as base64 subscription + raw configs
  const rawLines = finalConfigs.map((c) => c.raw).join("\n");
  const base64 = btoa(rawLines);

  return c.json({
    totalConfigs: finalConfigs.length,
    duplicatesRemoved: allConfigs.length - finalConfigs.length,
    errors: errors.length > 0 ? errors : undefined,
    base64,
    raw: rawLines,
    configs: finalConfigs.map(({ raw, ...rest }) => rest),
  });
});

// ─── Clean Configs (remove duplicates & invalid) ─────────────

tools.post("/clean", async (c) => {
  const { configs: rawText } = await c.req.json<{ configs: string }>();
  if (!rawText) return c.json({ error: "Missing 'configs'" }, 400);

  const allConfigs = parseSubscription(rawText);
  const seen = new Set<string>();
  const cleaned = allConfigs.filter((c) => {
    // Skip invalid (no address or port)
    if (!c.address || !c.port) return false;
    const key = `${c.protocol}:${c.address}:${c.port}:${c.id || c.password || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return c.json({
    original: allConfigs.length,
    cleaned: cleaned.length,
    removed: allConfigs.length - cleaned.length,
    base64: toBase64Sub(cleaned),
    raw: cleaned.map((c) => c.raw).join("\n"),
  });
});

export default tools;
