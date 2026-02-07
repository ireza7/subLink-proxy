/**
 * V2Ray Sub Worker - Main Server Entry
 *
 * Hono server running on Cloudflare Pages with:
 * - API routes under /api/*
 * - /sub?link=<url> direct proxy endpoint
 * - /?link=<url> root-level subscription fetch (rendered by SPA)
 * - SPA fallback for React frontend
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { cache } from "hono/cache";
import subscription from "./routes/subscription";
import tools from "./routes/tools";
import { fetchSubscription, parseSubInfo } from "./lib/fetcher";
import { parseSubscription } from "./lib/parser";
import {
  toClash,
  toSingbox,
  toQuantumultX,
  toSurge,
  toBase64Sub,
} from "./lib/converter";

type Bindings = {
  ASSETS: { fetch: typeof fetch };
};

const app = new Hono<{ Bindings: Bindings }>();

// ─── Middleware ───────────────────────────────────────────────

app.use("/api/*", cors());

// ─── API Routes ──────────────────────────────────────────────

app.route("/api/sub", subscription);
app.route("/api/tools", tools);

// ─── Health Check ────────────────────────────────────────────

app.get("/api/health", (c) => {
  return c.json({ status: "ok", version: "1.0.0", timestamp: Date.now() });
});

// ─── Direct Proxy: /sub?link=<url> ──────────────────────────
// This directly fetches and returns the content (NOT a redirect)
// so clients like v2rayN can use this as a subscription URL.

app.get("/sub", async (c) => {
  const link = c.req.query("link") || c.req.query("url");
  if (!link) {
    return c.redirect("/");
  }

  try {
    new URL(link);
  } catch {
    return c.text("Invalid URL", 400);
  }

  const format = (c.req.query("format") || "raw").toLowerCase();
  const result = await fetchSubscription(link);

  if (!result.ok) {
    return c.text(`Failed to fetch: ${result.error}`, 502);
  }

  // Pass subscription-userinfo header to client
  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  };

  if (result.headers["subscription-userinfo"]) {
    headers["subscription-userinfo"] = result.headers["subscription-userinfo"];
  }
  if (result.headers["profile-update-interval"]) {
    headers["profile-update-interval"] = result.headers["profile-update-interval"];
  }
  if (result.headers["content-disposition"]) {
    headers["content-disposition"] = result.headers["content-disposition"];
  }

  // Return in requested format
  if (format === "raw") {
    return c.text(result.content, 200, headers);
  }

  const configs = parseSubscription(result.content);

  switch (format) {
    case "base64":
      return c.text(toBase64Sub(configs), 200, headers);

    case "clash": {
      headers["Content-Type"] = "text/yaml; charset=utf-8";
      headers["Content-Disposition"] = 'attachment; filename="clash.yaml"';
      return c.text(toClash(configs), 200, headers);
    }

    case "singbox":
    case "sing-box": {
      headers["Content-Type"] = "application/json; charset=utf-8";
      headers["Content-Disposition"] = 'attachment; filename="singbox.json"';
      return c.text(toSingbox(configs), 200, headers);
    }

    case "quantumultx":
    case "quanx":
      return c.text(toQuantumultX(configs), 200, headers);

    case "surge":
      return c.text(toSurge(configs), 200, headers);

    default:
      return c.text(result.content, 200, headers);
  }
});

// ─── SPA Fallback: serve index.html for all non-API routes ───

app.get("*", async (c) => {
  try {
    const url = new URL(c.req.url);

    // Try to serve static assets first
    const assetRes = await c.env.ASSETS.fetch(new Request(c.req.url, c.req.raw));
    if (assetRes.status !== 404) {
      return assetRes;
    }

    // Fallback to index.html for SPA routing
    url.pathname = "/index.html";
    return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
  } catch {
    return c.html(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head><meta charset="UTF-8"/><title>V2Sub Worker</title></head>
<body style="background:#030712;color:#f3f4f6;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui">
<div style="text-align:center"><h1>V2Sub Worker</h1><p>Loading...</p></div>
</body>
</html>`);
  }
});

export default app;
