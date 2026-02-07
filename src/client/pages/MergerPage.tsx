import { useState } from "react";
import { mergeSubscriptions, MergeResult } from "../lib/api";
import { copyToClipboard, generateProxyLink } from "../lib/utils";

interface Props {
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export function MergerPage({ onToast }: Props) {
  const [urls, setUrls] = useState<string[]>([""]);
  const [removeDups, setRemoveDups] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MergeResult | null>(null);

  function addUrl() {
    if (urls.length >= 10) {
      onToast("حداکثر 10 لینک مجاز است", "error");
      return;
    }
    setUrls([...urls, ""]);
  }

  function removeUrl(index: number) {
    if (urls.length <= 1) return;
    setUrls(urls.filter((_, i) => i !== index));
  }

  function updateUrl(index: number, value: string) {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  }

  async function handleMerge() {
    const validUrls = urls.filter((u) => u.trim());
    if (validUrls.length === 0) {
      onToast("لطفا حداقل یک لینک وارد کنید", "error");
      return;
    }

    // Validate URLs
    for (const u of validUrls) {
      try {
        new URL(u);
      } catch {
        onToast(`لینک نامعتبر: ${u.substring(0, 50)}...`, "error");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await mergeSubscriptions(validUrls, removeDups);
      setResult(res);
      onToast(
        `${res.totalConfigs} کانفیگ ادغام شد (${res.duplicatesRemoved} تکراری حذف شد)`,
        "success"
      );
    } catch (err) {
      onToast(
        `خطا: ${err instanceof Error ? err.message : "مشکل ناشناخته"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCopyBase64() {
    if (!result) return;
    copyToClipboard(result.base64);
    onToast("خروجی Base64 کپی شد!", "success");
  }

  function handleCopyRaw() {
    if (!result) return;
    copyToClipboard(result.raw);
    onToast("خروجی Raw کپی شد!", "success");
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([result.base64], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged-subscription.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast("فایل دانلود شد!", "success");
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-base font-bold text-white mb-2">
          ادغام سابسکریپشن‌ها
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          چند لینک سابسکریپشن را با هم ترکیب کنید و یک سابسکریپشن واحد بسازید
        </p>

        <div className="space-y-3">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="text-xs text-gray-500 w-6 text-center shrink-0">
                {index + 1}
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                placeholder={`لینک سابسکریپشن ${index + 1}`}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                dir="ltr"
              />
              <button
                onClick={() => removeUrl(index)}
                disabled={urls.length <= 1}
                className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-30 p-1 shrink-0"
                title="حذف"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={addUrl}
            disabled={urls.length >= 10}
            className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-40 border border-gray-700"
          >
            + افزودن لینک
          </button>

          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={removeDups}
              onChange={(e) => setRemoveDups(e.target.checked)}
              className="rounded bg-gray-800 border-gray-600 text-primary focus:ring-primary"
            />
            حذف کانفیگ‌های تکراری
          </label>

          <div className="flex-1" />

          <button
            onClick={handleMerge}
            disabled={loading}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin-slow inline-block">⟳</span>
                <span>در حال ادغام...</span>
              </>
            ) : (
              <>
                <span>🔗</span>
                <span>ادغام</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="animate-fade-in space-y-4">
          {/* Stats */}
          <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
            <h3 className="text-sm font-bold text-white mb-3">نتیجه ادغام</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">کل کانفیگ‌ها</p>
                <p className="text-lg font-bold text-white">
                  {result.totalConfigs}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">تکراری حذف شده</p>
                <p className="text-lg font-bold text-yellow-400">
                  {result.duplicatesRemoved}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">پروتکل‌ها</p>
                <p className="text-lg font-bold text-accent">
                  {[...new Set(result.configs.map((c) => c.protocol))].length}
                </p>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-red-400 font-semibold mb-1">
                  خطاها:
                </p>
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-300" dir="ltr">
                    {err}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCopyBase64}
                className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary-light rounded-lg text-sm transition-colors"
              >
                📋 کپی Base64
              </button>
              <button
                onClick={handleCopyRaw}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-colors"
              >
                📋 کپی Raw
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-colors"
              >
                💾 دانلود فایل
              </button>
            </div>

            {/* Protocol breakdown */}
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(
                result.configs.reduce(
                  (acc, c) => {
                    acc[c.protocol] = (acc[c.protocol] || 0) + 1;
                    return acc;
                  },
                  {} as Record<string, number>
                )
              ).map(([proto, count]) => (
                <span
                  key={proto}
                  className="text-xs px-2 py-1 bg-gray-800 rounded-md text-gray-400"
                >
                  {proto.toUpperCase()}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            ادغام چندین سابسکریپشن
          </h3>
          <p className="text-sm max-w-md mx-auto">
            لینک‌های سابسکریپشن مختلف خود را وارد کنید تا همه کانفیگ‌ها در یک
            سابسکریپشن واحد ترکیب شوند. کانفیگ‌های تکراری به صورت خودکار حذف
            می‌شوند.
          </p>
        </div>
      )}
    </div>
  );
}
