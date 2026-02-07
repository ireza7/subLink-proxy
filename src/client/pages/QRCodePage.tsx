import { useState } from "react";
import { getQRCodeUrl, detectProtocol, copyToClipboard } from "../lib/utils";

interface Props {
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export function QRCodePage({ onToast }: Props) {
  const [input, setInput] = useState("");
  const [configs, setConfigs] = useState<string[]>([]);

  function handleGenerate() {
    if (!input.trim()) {
      onToast("لطفا حداقل یک کانفیگ وارد کنید", "error");
      return;
    }

    // Try to decode base64
    let text = input.trim();
    try {
      const decoded = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
      if (
        decoded.includes("vmess://") ||
        decoded.includes("vless://") ||
        decoded.includes("trojan://") ||
        decoded.includes("ss://")
      ) {
        text = decoded;
      }
    } catch {
      // not base64
    }

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => detectProtocol(l) !== null);

    if (lines.length === 0) {
      onToast("کانفیگ معتبری یافت نشد", "error");
      return;
    }

    setConfigs(lines);
    onToast(`${lines.length} کانفیگ شناسایی شد`, "success");
  }

  function handleCopyConfig(config: string) {
    copyToClipboard(config);
    onToast("کانفیگ کپی شد!", "success");
  }

  function extractName(uri: string): string {
    // Try to extract name from URI
    const hashIndex = uri.indexOf("#");
    if (hashIndex !== -1) {
      return decodeURIComponent(uri.substring(hashIndex + 1)).substring(0, 40);
    }

    // For vmess, try base64 decode
    if (uri.startsWith("vmess://")) {
      try {
        const encoded = uri.replace("vmess://", "");
        let s = encoded.replace(/-/g, "+").replace(/_/g, "/");
        while (s.length % 4 !== 0) s += "=";
        const decoded = atob(s);
        const json = JSON.parse(decoded);
        return json.ps || json.remark || "VMess";
      } catch {
        return "VMess";
      }
    }

    return detectProtocol(uri)?.toUpperCase() || "Config";
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-base font-bold text-white mb-2">
          ساخت QR Code کانفیگ
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          لینک‌های کانفیگ V2Ray را وارد کنید تا QR Code آنها ساخته شود. می‌توانید
          با اسکن QR Code کانفیگ را مستقیم به اپلیکیشن‌های V2Ray اضافه کنید.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`vmess://...\nvless://...\ntrojan://...\nss://...\n\nیا محتوای Base64 سابسکریپشن`}
          rows={8}
          className="code-block w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary resize-none"
          dir="ltr"
        />

        <button
          onClick={handleGenerate}
          disabled={!input.trim()}
          className="mt-3 w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          📱 ساخت QR Code
        </button>
      </div>

      {/* QR Codes Grid */}
      {configs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">
            QR Code‌ها ({configs.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {configs.map((config, i) => {
              const protocol = detectProtocol(config);
              const name = extractName(config);

              return (
                <div
                  key={i}
                  className="animate-fade-in bg-surface-light rounded-xl border border-gray-700/50 p-4 flex flex-col items-center gap-3"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400 font-mono">
                      {protocol?.toUpperCase()}
                    </span>
                    <span className="text-sm text-white truncate flex-1" dir="ltr">
                      {name}
                    </span>
                    <span className="text-xs text-gray-600">#{i + 1}</span>
                  </div>

                  <img
                    src={getQRCodeUrl(config, 220)}
                    alt={`QR Code for ${name}`}
                    className="w-[220px] h-[220px] bg-white rounded-lg p-2"
                    loading="lazy"
                  />

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleCopyConfig(config)}
                      className="flex-1 text-xs py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
                    >
                      📋 کپی لینک
                    </button>
                    <a
                      href={getQRCodeUrl(config, 400)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-xs py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors text-center"
                    >
                      💾 دانلود QR
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {configs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            ساخت QR Code
          </h3>
          <p className="text-sm max-w-md mx-auto">
            لینک‌های کانفیگ خود را وارد کنید تا QR Code قابل اسکن برای
            اپلیکیشن‌های V2Ray ساخته شود. از هر تعداد کانفیگ پشتیبانی می‌شود.
          </p>
        </div>
      )}
    </div>
  );
}
