import { useState } from "react";
import { cleanConfigs, CleanResult } from "../lib/api";
import { copyToClipboard } from "../lib/utils";

interface Props {
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export function CleanerPage({ onToast }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CleanResult | null>(null);

  async function handleClean() {
    if (!input.trim()) {
      onToast("لطفا کانفیگ‌ها را وارد کنید", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await cleanConfigs(input);
      setResult(res);
      onToast(
        `${res.cleaned} کانفیگ معتبر (${res.removed} مورد حذف شد)`,
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
    const blob = new Blob([result.raw], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned-configs.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast("فایل دانلود شد!", "success");
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-base font-bold text-white mb-2">
          پاکسازی کانفیگ‌ها
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          کانفیگ‌های تکراری و نامعتبر را حذف کنید. ورودی می‌تواند Base64 یا لینک‌های
          خام باشد.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`vmess://...\nvless://...\ntrojan://...\nss://...\n\nیا محتوای Base64 سابسکریپشن`}
          rows={12}
          className="code-block w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary resize-none"
          dir="ltr"
        />

        <div className="flex gap-3 mt-3">
          <button
            onClick={handleClean}
            disabled={loading || !input.trim()}
            className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin-slow inline-block">⟳</span>
                <span>در حال پاکسازی...</span>
              </>
            ) : (
              <>
                <span>🧹</span>
                <span>پاکسازی</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setInput("");
              setResult(null);
            }}
            className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-colors"
          >
            پاک کردن
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="animate-fade-in space-y-4">
          {/* Stats */}
          <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
            <h3 className="text-sm font-bold text-white mb-3">نتیجه پاکسازی</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">ورودی</p>
                <p className="text-lg font-bold text-gray-300">
                  {result.original}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">معتبر</p>
                <p className="text-lg font-bold text-green-400">
                  {result.cleaned}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">حذف شده</p>
                <p className="text-lg font-bold text-red-400">
                  {result.removed}
                </p>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">خروجی پاکسازی شده</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyBase64}
                  className="text-xs px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary-light rounded-md transition-colors"
                >
                  📋 Base64
                </button>
                <button
                  onClick={handleCopyRaw}
                  className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
                >
                  📋 Raw
                </button>
                <button
                  onClick={handleDownload}
                  className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
                >
                  💾 دانلود
                </button>
              </div>
            </div>
            <textarea
              value={result.raw}
              readOnly
              rows={10}
              className="code-block w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-green-400 focus:outline-none resize-none"
              dir="ltr"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🧹</div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            پاکسازی کانفیگ‌ها
          </h3>
          <p className="text-sm max-w-md mx-auto">
            کانفیگ‌های V2Ray خود را وارد کنید تا موارد تکراری و نامعتبر حذف شوند.
            خروجی تمیز و بدون تکرار دریافت کنید.
          </p>
          <div className="mt-4 flex justify-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500/50 rounded-full" />
              حذف تکراری
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500/50 rounded-full" />
              حذف نامعتبر
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500/50 rounded-full" />
              خروجی تمیز
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
