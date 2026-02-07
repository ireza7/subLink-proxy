/**
 * Tools API Routes
 *
 * Various V2Ray utility endpoints:
 *
 * POST /api/tools/decode    - Decode base64 content
 * POST /api/tools/encode    - Encode content to base64
 * POST /api/tools/parse-uri - Parse a single V2Ray URI
 * POST /api/tools/info      - Get subscription info from URL
 */

import { Hono } from "hono";
import { parseConfig } from "../lib/parser";
import { fetchSubscription, parseSubInfo } from "../lib/fetcher";

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
    return c.json({ error: "Failed to parse URI. Unsupported protocol or invalid format." }, 400);
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

export default tools;
