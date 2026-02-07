# V2Sub Worker

> V2Ray Subscription Proxy & Toolkit on Cloudflare Workers/Pages

A powerful, zero-config tool for proxying, converting, merging, and managing V2Ray subscription links. Runs entirely on Cloudflare Workers — no servers, no databases, no special bindings needed.

## Features

- **Subscription Proxy** — Fetch and relay subscription content through Cloudflare Workers. Use as a direct subscription URL in V2Ray clients
- **Format Converter** — Convert between Clash, Sing-box, Surge, Quantumult X, Base64, JSON
- **Config Parser** — Analyze and extract details from V2Ray config URIs
- **Subscription Merger** — Combine multiple subscriptions into one with duplicate removal
- **Config Cleaner** — Remove duplicates and invalid configs
- **QR Code Generator** — Generate scannable QR codes for mobile V2Ray apps
- **Base64 Tool** — Encode/decode Base64 content
- **Subscription Info** — Display traffic usage, expiry date from subscription headers

## Supported Protocols

| Protocol | URI Scheme |
|----------|-----------|
| VMess | `vmess://` |
| VLESS | `vless://` |
| Trojan | `trojan://` |
| Shadowsocks | `ss://` |
| Hysteria2 | `hysteria2://` / `hy2://` |

## Quick Deploy

### Method 1: Cloudflare Dashboard (Recommended)

1. **Fork** this repository
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
3. Click **Create application** → **Pages** → **Connect to Git**
4. Select your forked repository
5. Set build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click **Save and Deploy**

### Method 2: CLI Deploy

```bash
git clone <repo-url>
cd v2ray-sub-worker
npm install
npm run build
npx wrangler pages deploy dist
```

### Method 3: Upload

```bash
npm run build
# Then upload the dist/ folder in Cloudflare Dashboard
```

## Usage

### As a Subscription Proxy

Use the `/sub` endpoint directly as a subscription URL in V2Ray clients:

```
https://your-worker.pages.dev/sub?link=<SUBSCRIPTION_URL>
```

With format conversion:

```
https://your-worker.pages.dev/sub?link=<URL>&format=clash
https://your-worker.pages.dev/sub?link=<URL>&format=singbox
https://your-worker.pages.dev/sub?link=<URL>&format=surge
https://your-worker.pages.dev/sub?link=<URL>&format=quantumultx
https://your-worker.pages.dev/sub?link=<URL>&format=base64
```

### Web Interface

Visit the root URL to access the full-featured web interface with all tools.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/sub?link=<URL>&format=<FORMAT>` | Direct subscription proxy |
| `GET` | `/api/sub?url=<URL>&format=<FORMAT>` | Fetch & convert (JSON) |
| `POST` | `/api/sub/parse` | Parse raw config text |
| `POST` | `/api/sub/convert` | Convert configs to format |
| `POST` | `/api/tools/merge` | Merge multiple subscriptions |
| `POST` | `/api/tools/clean` | Remove duplicates & invalid |
| `POST` | `/api/tools/decode` | Base64 decode |
| `POST` | `/api/tools/encode` | Base64 encode |
| `POST` | `/api/tools/parse-uri` | Parse single V2Ray URI |
| `POST` | `/api/tools/info` | Get subscription info |
| `GET` | `/api/health` | Health check |

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build

# Preview with wrangler
npm run preview
```

## Project Structure

```
v2ray-sub-worker/
├── src/
│   ├── client/                  # React frontend (SPA)
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Header.tsx
│   │   │   ├── ConfigCard.tsx
│   │   │   ├── SubInfoBar.tsx
│   │   │   └── Toast.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useToast.ts
│   │   ├── lib/                 # Client utilities
│   │   │   ├── api.ts           # API client functions
│   │   │   └── utils.ts         # Helper utilities
│   │   ├── pages/               # Page components
│   │   │   ├── SubscriptionPage.tsx
│   │   │   ├── ConverterPage.tsx
│   │   │   ├── ParserPage.tsx
│   │   │   ├── MergerPage.tsx
│   │   │   ├── CleanerPage.tsx
│   │   │   ├── QRCodePage.tsx
│   │   │   ├── Base64Page.tsx
│   │   │   └── AboutPage.tsx
│   │   ├── styles/
│   │   │   └── app.css          # Tailwind CSS + custom styles
│   │   ├── App.tsx              # Root component
│   │   ├── main.tsx             # Entry point
│   │   └── index.html           # HTML template
│   │
│   └── server/                  # Hono backend (Cloudflare Worker)
│       ├── lib/                 # Server utilities
│       │   ├── converter.ts     # Format converters
│       │   ├── fetcher.ts       # Subscription fetcher
│       │   └── parser.ts        # V2Ray URI parser
│       ├── routes/              # API route handlers
│       │   ├── subscription.ts  # /api/sub routes
│       │   └── tools.ts         # /api/tools routes
│       └── index.ts             # Server entry point
│
├── dist/                        # Build output (deploy this)
├── package.json
├── tsconfig.json
├── vite.config.ts               # Vite build config
├── wrangler.toml                # Cloudflare config
└── README.md
```

## Tech Stack

- **[Hono](https://hono.dev)** — Lightweight web framework for Cloudflare Workers
- **[React](https://react.dev)** — Frontend UI library
- **[Vite](https://vite.dev)** — Build tool with HMR
- **[Tailwind CSS v4](https://tailwindcss.com)** — Utility-first CSS
- **[TypeScript](https://www.typescriptlang.org)** — Type safety
- **[Cloudflare Pages](https://pages.cloudflare.com)** — Deployment platform

## License

MIT
