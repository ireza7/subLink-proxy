export function AboutPage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
          V2
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">V2Sub Worker</h1>
        <p className="text-gray-400">
          ابزار مدیریت سابسکریپشن V2Ray بر روی Cloudflare Workers
        </p>
        <p className="text-xs text-gray-500 mt-2">نسخه 1.0.0</p>
      </div>

      {/* Features */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-6">
        <h2 className="text-lg font-bold text-white mb-4">امکانات</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: "📡",
              title: "پروکسی سابسکریپشن",
              desc: "دریافت و نمایش محتوای سابسکریپشن از طریق Worker",
            },
            {
              icon: "🔄",
              title: "تبدیل کانفیگ",
              desc: "تبدیل بین فرمت‌های Clash, Sing-box, Surge, Quantumult X",
            },
            {
              icon: "🔍",
              title: "تحلیل کانفیگ",
              desc: "تحلیل و استخراج جزئیات لینک‌های V2Ray",
            },
            {
              icon: "🔐",
              title: "ابزار Base64",
              desc: "رمزگذاری و رمزگشایی Base64",
            },
            {
              icon: "📊",
              title: "اطلاعات سابسکریپشن",
              desc: "نمایش مصرف ترافیک، تاریخ انقضا و...",
            },
            {
              icon: "🔗",
              title: "لینک پروکسی",
              desc: "ایجاد لینک پروکسی برای دسترسی از طریق Worker",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30"
            >
              <div className="text-xl mb-2">{f.icon}</div>
              <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Protocols */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-6">
        <h2 className="text-lg font-bold text-white mb-4">پروتکل‌های پشتیبانی شده</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "VMess", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
            { name: "VLESS", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
            { name: "Trojan", color: "bg-red-500/20 text-red-400 border-red-500/30" },
            { name: "Shadowsocks", color: "bg-green-500/20 text-green-400 border-green-500/30" },
            { name: "Hysteria2", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
          ].map((p) => (
            <span
              key={p.name}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium ${p.color}`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* API Docs */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-6">
        <h2 className="text-lg font-bold text-white mb-4">API</h2>
        <div className="space-y-3 text-sm" dir="ltr">
          {[
            {
              method: "GET",
              path: "/api/sub?url=<URL>&format=<FORMAT>",
              desc: "Fetch & convert subscription",
            },
            {
              method: "GET",
              path: "/sub?link=<URL>&format=<FORMAT>",
              desc: "Proxy subscription (redirect)",
            },
            {
              method: "POST",
              path: "/api/sub/parse",
              desc: "Parse raw config text (body)",
            },
            {
              method: "POST",
              path: "/api/sub/convert",
              desc: "Convert configs to format",
            },
            {
              method: "POST",
              path: "/api/tools/decode",
              desc: "Base64 decode",
            },
            {
              method: "POST",
              path: "/api/tools/encode",
              desc: "Base64 encode",
            },
            {
              method: "POST",
              path: "/api/tools/parse-uri",
              desc: "Parse single V2Ray URI",
            },
            {
              method: "GET",
              path: "/api/health",
              desc: "Health check",
            },
          ].map((api) => (
            <div
              key={api.path}
              className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg"
            >
              <span
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  api.method === "GET"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {api.method}
              </span>
              <div className="flex-1">
                <code className="text-gray-200 text-xs">{api.path}</code>
                <p className="text-gray-500 text-xs mt-0.5">{api.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deploy Info */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-6">
        <h2 className="text-lg font-bold text-white mb-4">دپلوی</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>این پروژه برای اجرا روی Cloudflare Workers طراحی شده و نیاز به هیچ تنظیمات خاصی ندارد.</p>
          <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-xs text-gray-300 space-y-1" dir="ltr">
            <p className="text-gray-500"># Clone & Deploy</p>
            <p>git clone &lt;repo-url&gt;</p>
            <p>cd v2ray-sub-worker</p>
            <p>npm install</p>
            <p>npm run deploy</p>
          </div>
          <p>
            همچنین می‌توانید از طریق <strong className="text-white">Cloudflare Dashboard</strong> و بخش Workers &gt; Create &gt; Import from GitHub مستقیما دپلوی کنید.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-gray-600">
        <p>Built with Hono + React + Vite + Tailwind CSS</p>
        <p className="mt-1">Designed for Cloudflare Workers</p>
      </div>
    </div>
  );
}
