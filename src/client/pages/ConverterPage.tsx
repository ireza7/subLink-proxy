import { useState } from "react";
import { convertConfigs } from "../lib/api";
import { copyToClipboard } from "../lib/utils";

interface Props {
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export function ConverterPage({ onToast }: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState("clash");
  const [loading, setLoading] = useState(false);

  const formats = [
    { id: "clash", label: "Clash YAML", desc: "برای Clash / Clash Meta / Mihomo" },
    { id: "singbox", label: "Sing-box JSON", desc: "برای sing-box client" },
    { id: "surge", label: "Surge", desc: "برای Surge (iOS/macOS)" },
    { id: "quantumultx", label: "Quantumult X", desc: "برای Quantumult X (iOS)" },
    { id: "base64", label: "Base64 Subscription", desc: "سابسکریپشن کدگذاری شده" },
    { id: "json", label: "JSON", desc: "خروجی ساختاریافته JSON" },
  ];

  async function handleConvert() {
    if (!input.trim()) {
      onToast("لطفا کانفیگ‌ها را وارد کنید", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await convertConfigs(input, format);
      setOutput(result);
      onToast("تبدیل با موفقیت انجام شد!", "success");
    } catch (err) {
      onToast(
        `خطا: ${err instanceof Error ? err.message : "مشکل ناشناخته"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!output) return;
    copyToClipboard(output);
    onToast("خروجی کپی شد!", "success");
  }

  function handleDownload() {
    if (!output) return;

    const extensions: Record<string, string> = {
      clash: "yaml",
      singbox: "json",
      surge: "conf",
      quantumultx: "conf",
      base64: "txt",
      json: "json",
    };

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `v2ray-configs.${extensions[format] || "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast("فایل دانلود شد!", "success");
  }

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-base font-bold text-white mb-4">انتخاب فرمت خروجی</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`p-3 rounded-lg border text-right transition-all ${
                format === f.id
                  ? "border-primary bg-primary/10 text-white"
                  : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
              }`}
            >
              <p className="text-sm font-medium">{f.label}</p>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">ورودی (کانفیگ‌ها / سابسکریپشن)</h3>
            <button
              onClick={() => setInput("")}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              پاک کردن
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`vmess://...\nvless://...\ntrojan://...\nss://...\n\nیا محتوای Base64 سابسکریپشن`}
            rows={14}
            className="code-block w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary resize-none"
            dir="ltr"
          />
          <button
            onClick={handleConvert}
            disabled={loading || !input.trim()}
            className="mt-3 w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "در حال تبدیل..." : `تبدیل به ${formats.find((f) => f.id === format)?.label}`}
          </button>
        </div>

        {/* Output */}
        <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">
              خروجی ({formats.find((f) => f.id === format)?.label})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors disabled:opacity-40"
              >
                📋 کپی
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors disabled:opacity-40"
              >
                💾 دانلود
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            rows={14}
            className="code-block w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-green-400 placeholder-gray-600 focus:outline-none resize-none"
            dir="ltr"
            placeholder="خروجی تبدیل شده اینجا نمایش داده می‌شود..."
          />
        </div>
      </div>
    </div>
  );
}
