import { useState } from "react";
import { parseUri, SubConfig } from "../lib/api";

interface Props {
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export function ParserPage({ onToast }: Props) {
  const [uri, setUri] = useState("");
  const [config, setConfig] = useState<SubConfig | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleParse() {
    if (!uri.trim()) {
      onToast("لطفا یک URI وارد کنید", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await parseUri(uri.trim());
      setConfig(result);
      onToast("کانفیگ با موفقیت تحلیل شد!", "success");
    } catch (err) {
      onToast(
        `خطا: ${err instanceof Error ? err.message : "فرمت نامعتبر"}`,
        "error"
      );
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }

  const examples = [
    "vmess://eyJ2IjoiMiIsInBzIjoiVGVzdCIsImFkZCI6IjEuMi4zLjQiLCJwb3J0IjoiNDQzIiwiaWQiOiJ1dWlkLWhlcmUiLCJhaWQiOiIwIiwibmV0Ijoid3MiLCJ0eXBlIjoibm9uZSIsImhvc3QiOiIiLCJwYXRoIjoiLyIsInRscyI6InRscyJ9",
    "vless://uuid-here@example.com:443?type=ws&security=tls&sni=example.com#Test",
    "trojan://password@example.com:443?sni=example.com#Test",
    "ss://YWVzLTI1Ni1nY206cGFzc3dvcmQ=@example.com:8388#Test",
  ];

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-base font-bold text-white mb-4">تحلیل کانفیگ V2Ray</h2>
        <p className="text-sm text-gray-400 mb-4">
          یک لینک کانفیگ V2Ray وارد کنید تا جزئیات آن استخراج شود
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="vmess://... | vless://... | trojan://... | ss://..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary code-block"
            dir="ltr"
            onKeyDown={(e) => e.key === "Enter" && handleParse()}
          />
          <button
            onClick={handleParse}
            disabled={loading}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "🔍 تحلیل"}
          </button>
        </div>

        {/* Examples */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">نمونه‌ها:</p>
          <div className="flex flex-wrap gap-2">
            {["vmess://", "vless://", "trojan://", "ss://"].map((proto, i) => (
              <button
                key={proto}
                onClick={() => {
                  setUri(examples[i]);
                  onToast(`نمونه ${proto} بارگذاری شد`, "info");
                }}
                className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded-md border border-gray-700 transition-colors"
                dir="ltr"
              >
                {proto}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {config && (
        <div className="animate-fade-in bg-surface-light rounded-xl border border-gray-700/50 p-5">
          <h3 className="text-base font-bold text-white mb-4">نتیجه تحلیل</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="ltr">
              <tbody>
                {Object.entries(config).map(([key, value]) => {
                  if (value === undefined || value === null || value === "") return null;
                  return (
                    <tr key={key} className="border-b border-gray-700/30">
                      <td className="py-2.5 px-3 text-gray-400 font-mono text-xs whitespace-nowrap font-medium">
                        {key}
                      </td>
                      <td className="py-2.5 px-3 text-gray-200 font-mono text-xs break-all">
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* JSON View */}
          <details className="mt-4">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
              نمایش JSON کامل
            </summary>
            <pre className="mt-2 code-block bg-gray-800 rounded-lg p-3 text-xs text-green-400 overflow-x-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
