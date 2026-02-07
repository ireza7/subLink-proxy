export function AboutPage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary/20">
          V2
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">V2Sub Worker</h1>
        <p className="text-gray-400">
          ابزار مدیریت و پروکسی سابسکریپشن V2Ray بر روی Cloudflare Workers
        </p>
        <p className="text-xs text-gray-500 mt-2">نسخه 1.0.0 &bull; اوپن سورس &bull; بدون نیاز به تنظیمات</p>
      </div>

      {/* Features */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-6">
        <h2 className="text-lg font-bold text-white mb-4">امکانات</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: "📡",
              title: "پروکسی سابسکریپشن",
              desc: "دریافت و نمایش محتوای سابسکریپشن از طریق Worker. قابل استفاده مستقیم به عنوان لینک سابسکریپشن در کلاینت‌ها",
            },
            {
              icon: "🔄",
              title: "تبدیل فرمت کانفیگ",
              desc: "تبدیل بین فرمت‌های Clash, Sing-box, Surge, Quantumult X, Base64, JSON",
            },
            {
              icon: "🔍",
              title: "تحلیل کانفیگ",
              desc: "تحلیل و استخراج جزئیات لینک‌های V2Ray با نمایش تمام پارامترها",
            },
            {
              icon: "🔗",
              title: "ادغام سابسکریپشن",
              desc: "ترکیب چندین سابسکریپشن مختلف در یک خروجی واحد با حذف تکراری‌ها",
            },
            {
              icon: "🧹",
              title: "پاکسازی کانفیگ",
              desc: "حذف کانفیگ‌های تکراری و نامعتبر از لیست سابسکریپشن",
            },
            {
              icon: "📱",
              title: "ساخت QR Code",
              desc: "تبدیل لینک‌های کانفیگ به QR Code قابل اسکن برای اپلیکیشن‌های موبایل",
            },
            {
              icon: "🔐",
              title: "ابزار Base64",
              desc: "رمزگذاری و رمزگشایی Base64 برای محتوای سابسکریپشن",
            },
            {
              icon: "📊",
              title: "اطلاعات سابسکریپشن",
              desc: "نمایش مصرف ترافیک، تاریخ انقضا، آپلود و دانلود از هدر سابسکریپشن",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30"
            >
              <div className="text-xl mb-2">{f.icon}</div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Protocols */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          پروتکل‌های پشتیبانی شده
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            {
              name: "VMess",
              color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            },
            {
              name: "VLESS",
              color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
            },
            {
              name: "Trojan",
              color: "bg-red-500/20 text-red-400 border-red-500/30",
            },
            {
              name: "Shadowsocks",
              color: "bg-green-500/20 text-green-400 border-green-500/30",
            },
            {
              name: "Hysteria2",
              color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
            },
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

      {/* Direct Proxy Usage */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-6">
        <h2 className="text-lg font-bold text-white mb-4">استفاده به عنوان پروکسی</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            می‌توانید مستقیما از آدرس Worker به عنوان لینک سابسکریپشن در کلاینت‌های V2Ray استفاده کنید:
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2" dir="ltr">
            <p className="text-xs text-gray-500"># Raw subscription (default)</p>
            <p className="text-xs text-accent break-all">
              https://your-worker.pages.dev/sub?link=https://example.com/sub
            </p>
            <p className="text-xs text-gray-500 mt-3"># Convert to Clash format</p>
            <p className="text-xs text-accent break-all">
              https://your-worker.pages.dev/sub?link=https://example.com/sub&format=clash
            </p>
            <p className="text-xs text-gray-500 mt-3"># Convert to Sing-box format</p>
            <p className="text-xs text-accent break-all">
              https://your-worker.pages.dev/sub?link=https://example.com/sub&format=singbox
            </p>
          </div>
          <p className="text-xs text-gray-500">
            فرمت‌های موجود: raw, base64, clash, singbox, surge, quantumultx
          </p>
        </div>
      </div>

      {/* API Docs */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-6">
        <h2 className="text-lg font-bold text-white mb-4">API مستندات</h2>
        <div className="space-y-3 text-sm" dir="ltr">
          {[
            {
              method: "GET",
              path: "/sub?link=<URL>&format=<FORMAT>",
              desc: "Direct subscription proxy - use as subscription URL in clients",
            },
            {
              method: "GET",
              path: "/api/sub?url=<URL>&format=<FORMAT>",
              desc: "Fetch & convert subscription (JSON response)",
            },
            {
              method: "POST",
              path: "/api/sub/parse",
              desc: "Parse raw config text (body) to JSON",
            },
            {
              method: "POST",
              path: "/api/sub/convert",
              desc: "Convert configs to target format",
            },
            {
              method: "POST",
              path: "/api/tools/merge",
              desc: "Merge multiple subscription URLs",
            },
            {
              method: "POST",
              path: "/api/tools/clean",
              desc: "Remove duplicates & invalid configs",
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
              method: "POST",
              path: "/api/tools/info",
              desc: "Get subscription info from URL headers",
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
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold shrink-0 ${
                  api.method === "GET"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {api.method}
              </span>
              <div className="flex-1 min-w-0">
                <code className="text-gray-200 text-xs break-all">{api.path}</code>
                <p className="text-gray-500 text-xs mt-0.5">{api.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deploy Info */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-6">
        <h2 className="text-lg font-bold text-white mb-4">دپلوی</h2>
        <div className="space-y-4 text-sm text-gray-400">
          <p>
            این پروژه برای اجرا روی Cloudflare Workers/Pages طراحی شده و نیاز به
            هیچ تنظیمات خاصی (KV, D1, R2 و...) ندارد.
          </p>

          <div>
            <h3 className="text-white font-semibold text-sm mb-2">روش ۱: از طریق GitHub (توصیه شده)</h3>
            <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-xs text-gray-300 space-y-1" dir="ltr">
              <p className="text-gray-500"># 1. Fork the repository</p>
              <p className="text-gray-500"># 2. Go to Cloudflare Dashboard &gt; Workers & Pages</p>
              <p className="text-gray-500"># 3. Create application &gt; Pages &gt; Connect to Git</p>
              <p className="text-gray-500"># 4. Select your forked repository</p>
              <p className="text-gray-500"># 5. Set build command: npm run build</p>
              <p className="text-gray-500"># 6. Set output directory: dist</p>
              <p className="text-gray-500"># 7. Deploy!</p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-2">روش ۲: از طریق CLI</h3>
            <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-xs text-gray-300 space-y-1" dir="ltr">
              <p>git clone &lt;repo-url&gt;</p>
              <p>cd v2ray-sub-worker</p>
              <p>npm install</p>
              <p>npm run build</p>
              <p>npx wrangler pages deploy dist</p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-2">روش ۳: آپلود مستقیم</h3>
            <div className="bg-gray-800/50 rounded-lg p-4 text-xs text-gray-300" dir="ltr">
              <p>1. Run <code className="text-accent">npm run build</code> locally</p>
              <p>2. Go to Cloudflare Dashboard &gt; Workers & Pages</p>
              <p>3. Create application &gt; Pages &gt; Upload assets</p>
              <p>4. Upload the <code className="text-accent">dist/</code> folder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-6">
        <h2 className="text-lg font-bold text-white mb-4">تکنولوژی‌ها</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "Hono", desc: "Backend Framework", color: "text-orange-400" },
            { name: "React", desc: "Frontend UI", color: "text-cyan-400" },
            { name: "Vite", desc: "Build Tool", color: "text-purple-400" },
            { name: "Tailwind CSS", desc: "Styling", color: "text-blue-400" },
            { name: "TypeScript", desc: "Language", color: "text-blue-300" },
            { name: "Cloudflare", desc: "Platform", color: "text-orange-300" },
          ].map((tech) => (
            <div
              key={tech.name}
              className="bg-gray-800/50 rounded-lg p-3 text-center"
            >
              <p className={`text-sm font-semibold ${tech.color}`}>
                {tech.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
