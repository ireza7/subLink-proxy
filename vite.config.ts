import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import build from "@hono/vite-build/cloudflare-pages";
import path from "path";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    // Build client (React SPA) → dist/
    return {
      plugins: [react(), tailwindcss()],
      root: "src/client",
      resolve: {
        alias: {
          "@client": path.resolve(__dirname, "src/client"),
        },
      },
      build: {
        outDir: path.resolve(__dirname, "dist"),
        emptyOutDir: true,
        rollupOptions: {
          output: {
            entryFileNames: "assets/[name]-[hash].js",
            chunkFileNames: "assets/[name]-[hash].js",
            assetFileNames: "assets/[name]-[hash].[ext]",
          },
        },
        copyPublicDir: false,
      },
    };
  }

  // Build server (Hono → Cloudflare Pages Function) → dist/_worker.js
  return {
    plugins: [
      build({
        entry: "src/server/index.ts",
        outputDir: "dist",
        emptyOutDir: false,
        minify: true,
      }),
    ],
    resolve: {
      alias: {
        "@server": path.resolve(__dirname, "src/server"),
      },
    },
  };
});
