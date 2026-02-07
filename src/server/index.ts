/**
 * V2Ray Sub Worker - Main Server Entry
 *
 * Hono server running on Cloudflare Pages with:
 * - API routes under /api/*
 * - /sub?link=<url> proxy endpoint
 * - SPA fallback for React frontend
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import subscription from "./routes/subscription";
import tools from "./routes/tools";

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
  return c.json({ status: "ok", timestamp: Date.now() });
});

// ─── Proxy: /sub?link=<url> ──────────────────────────────────

app.get("/sub", async (c) => {
  const link = c.req.query("link") || c.req.query("url");
  if (!link) {
    // Redirect to home page
    return c.redirect("/");
  }

  try {
    new URL(link);
  } catch {
    return c.text("Invalid URL", 400);
  }

  const format = c.req.query("format") || "raw";
  const apiUrl = new URL(c.req.url);
  apiUrl.pathname = "/api/sub";
  apiUrl.searchParams.set("url", link);
  apiUrl.searchParams.set("format", format);

  return c.redirect(apiUrl.toString(), 302);
});

// ─── SPA Fallback: serve index.html for all non-API routes ───

app.get("*", async (c) => {
  // Use the ASSETS binding to serve the static index.html
  // This enables SPA routing for React client
  try {
    const url = new URL(c.req.url);
    url.pathname = "/index.html";
    return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
  } catch {
    return c.html(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head><meta charset="UTF-8"/><title>V2Sub Worker</title></head>
<body><p>Loading...</p></body>
</html>`);
  }
});

export default app;
