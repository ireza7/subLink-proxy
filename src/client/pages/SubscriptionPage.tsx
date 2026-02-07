import { useState, useEffect } from "react";
import { fetchSub, SubResponse, SubConfig } from "../lib/api";
import { copyToClipboard } from "../lib/utils";
import { ConfigCard } from "../components/ConfigCard";
import { SubInfoBar } from "../components/SubInfoBar";

interface Props {
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export function SubscriptionPage({ onToast }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SubResponse | null>(null);
  const [filter, setFilter] = useState("");
  const [exportFormat, setExportFormat] = useState("json");

  // Check URL params on mount (for /?link=... support)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const link = params.get("link") || params.get("url");
    if (link) {
      setUrl(link);
      handleFetch(link);
    }
  }, []);

  async function handleFetch(fetchUrl?: string) {
    const targetUrl = fetchUrl || url;
    if (!targetUrl.trim()) {
      onToast("لطفا لینک سابسکریپشن را وارد کنید", "error");
      return;
    }

    try {
      new URL(targetUrl);
    } catch {
      onToast("لینک وارد شده معتبر نیست", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchSub(targetUrl, "json");
      setData(result as SubResponse);
      onToast(`${(result as SubResponse).count} کانفیگ دریافت شد`, "success");
    } catch (err) {
      onToast(
        `خطا: ${err instanceof Error ? err.message : "مشکل ناشناخته"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const result = await fetchSub(url, exportFormat);
      if (typeof result === "string") {
        await copyToClipboard(result);
        onToast(`خروجی ${exportFormat.toUpperCase()} کپی شد!`, "success");
      } else {
        await copyToClipboard(JSON.stringify(result, null, 2));
        onToast("JSON کپی شد!", "success");
      }
    } catch (err) {
      onToast(`خطا: ${err instanceof Error ? err.message : "مشکل"}`, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleGenerateProxyLink() {
    if (!url.trim()) return;
    const base = window.location.origin;
    const proxyLink = `${base}/sub?link=${encodeURIComponent(url)}&format=${exportFormat}`;
    copyToClipboard(proxyLink);
    onToast("لینک پروکسی سابسکریپشن کپی شد!", "success");
  }

  const filteredConfigs: SubConfig[] = data
    ? data.configs.filter(
        (c) =>
          !filter ||
          c.name.toLowerCase().includes(filter.toLowerCase()) ||
          c.protocol.toLowerCase().includes(filter.toLowerCase()) ||
          c.address.toLowerCase().includes(filter.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-base font-bold text-white mb-4">دریافت سابسکریپشن</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/sub?token=..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            dir="ltr"
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
          />
          <button
            onClick={() => handleFetch()}
            disabled={loading}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin-slow inline-block">⟳</span>
                <span>در حال دریافت...</span>
              </>
            ) : (
              <>
                <span>📡</span>
                <span>دریافت</span>
              </>
            )}
          </button>
        </div>

        {/* Export Row */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="text-xs text-gray-400">فرمت خروجی:</label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-primary"
          >
            <option value="json">JSON</option>
            <option value="base64">Base64</option>
            <option value="clash">Clash YAML</option>
            <option value="singbox">Sing-box</option>
            <option value="surge">Surge</option>
            <option value="quantumultx">Quantumult X</option>
            <option value="raw">Raw</option>
          </select>

          <button
            onClick={handleExport}
            disabled={loading || !url}
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-colors disabled:opacity-40"
          >
            📋 کپی خروجی
          </button>

          <button
            onClick={handleGenerateProxyLink}
            disabled={!url}
            className="px-4 py-1.5 bg-accent/20 hover:bg-accent/30 text-accent-light rounded-lg text-sm transition-colors disabled:opacity-40"
          >
            🔗 لینک پروکسی
          </button>
        </div>
      </div>

      {/* Subscription Info */}
      {data?.subInfo && <SubInfoBar info={data.subInfo} />}

      {/* Configs */}
      {data && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-white">
              کانفیگ‌ها ({filteredConfigs.length}/{data.count})
            </h3>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="فیلتر بر اساس نام، پروتکل، آدرس..."
              className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          {filteredConfigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConfigs.map((config, i) => (
                <ConfigCard
                  key={i}
                  config={config}
                  index={i}
                  onCopy={(msg) => onToast(msg, "success")}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>کانفیگی یافت نشد</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!data && !loading && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-4">📡</div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">لینک سابسکریپشن خود را وارد کنید</h3>
          <p className="text-sm">
            لینک سابسکریپشن V2Ray خود را در بالا وارد کنید تا کانفیگ‌ها نمایش داده شوند
          </p>
          <div className="mt-6 p-4 bg-surface-light rounded-xl border border-gray-700/50 max-w-lg mx-auto text-right text-xs text-gray-400 space-y-2">
            <p><strong className="text-gray-300">پشتیبانی از پروتکل‌ها:</strong> VMess, VLESS, Trojan, Shadowsocks, Hysteria2</p>
            <p><strong className="text-gray-300">فرمت‌های خروجی:</strong> Clash, Sing-box, Surge, Quantumult X, JSON, Base64</p>
            <p><strong className="text-gray-300">قابلیت پروکسی:</strong> لینک سابسکریپشن را از طریق Worker دریافت کنید</p>
          </div>
        </div>
      )}
    </div>
  );
}
