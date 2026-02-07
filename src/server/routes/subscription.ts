/**
 * Subscription API Routes
 *
 * GET /api/sub?url=<encoded_url>&format=<format>
 *   - Fetches subscription, optionally converts to target format
 *   - Formats: raw, base64, clash, singbox, surge, quantumultx, json
 *
 * POST /api/sub/parse
 *   - Parses raw config text (body) and returns structured JSON
 */

import { Hono } from "hono";
import { fetchSubscription, parseSubInfo } from "../lib/fetcher";
import { parseSubscription } from "../lib/parser";
import {
  toClash,
  toSingbox,
  toQuantumultX,
  toSurge,
  toBase64Sub,
  toJSON,
} from "../lib/converter";

const subscription = new Hono();

// ─── Fetch & Convert Subscription ─────────────────────────────

subscription.get("/", async (c) => {
  const url = c.req.query("url") || c.req.query("link");
  const format = (c.req.query("format") || "json").toLowerCase();

  if (!url) {
    return c.json(
      { error: "Missing 'url' or 'link' query parameter" },
      400
    );
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return c.json({ error: "Invalid URL provided" }, 400);
  }

  const result = await fetchSubscription(url);

  if (!result.ok) {
    return c.json(
      { error: "Failed to fetch subscription", details: result.error },
      502
    );
  }

  const configs = parseSubscription(result.content);
  const subInfo = result.headers["subscription-userinfo"]
    ? parseSubInfo(result.headers["subscription-userinfo"])
    : null;

  // Return in requested format
  switch (format) {
    case "raw":
      return c.text(result.content);

    case "base64":
      return c.text(toBase64Sub(configs));

    case "clash":
      return c.text(toClash(configs), 200, {
        "Content-Type": "text/yaml; charset=utf-8",
        "Content-Disposition": 'attachment; filename="clash.yaml"',
      });

    case "singbox":
    case "sing-box":
      return c.text(toSingbox(configs), 200, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="singbox.json"',
      });

    case "quantumultx":
    case "quanx":
      return c.text(toQuantumultX(configs), 200, {
        "Content-Type": "text/plain; charset=utf-8",
      });

    case "surge":
      return c.text(toSurge(configs), 200, {
        "Content-Type": "text/plain; charset=utf-8",
      });

    case "json":
    default:
      return c.json({
        count: configs.length,
        subInfo,
        headers: result.headers,
        configs: configs.map(({ raw, ...rest }) => rest),
      });
  }
});

// ─── Parse Raw Config Text ─────────────────────────────────────

subscription.post("/parse", async (c) => {
  const body = await c.req.text();
  if (!body.trim()) {
    return c.json({ error: "Empty body" }, 400);
  }

  const configs = parseSubscription(body);
  return c.json({
    count: configs.length,
    configs: configs.map(({ raw, ...rest }) => rest),
  });
});

// ─── Convert Configs to Format ──────────────────────────────────

subscription.post("/convert", async (c) => {
  const { configs: rawConfigs, format } = await c.req.json<{
    configs: string;
    format: string;
  }>();

  if (!rawConfigs || !format) {
    return c.json({ error: "Missing 'configs' or 'format'" }, 400);
  }

  const configs = parseSubscription(rawConfigs);

  switch (format.toLowerCase()) {
    case "clash":
      return c.text(toClash(configs));
    case "singbox":
    case "sing-box":
      return c.text(toSingbox(configs));
    case "quantumultx":
    case "quanx":
      return c.text(toQuantumultX(configs));
    case "surge":
      return c.text(toSurge(configs));
    case "base64":
      return c.text(toBase64Sub(configs));
    case "json":
      return c.text(toJSON(configs));
    default:
      return c.json({ error: `Unknown format: ${format}` }, 400);
  }
});

export default subscription;
