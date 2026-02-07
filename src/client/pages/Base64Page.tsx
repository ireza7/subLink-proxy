import { useState } from "react";
import { decodeBase64, encodeBase64 } from "../lib/api";
import { copyToClipboard } from "../lib/utils";

interface Props {
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export function Base64Page({ onToast }: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"decode" | "encode">("decode");
  const [loading, setLoading] = useState(false);

  async function handleProcess() {
    if (!input.trim()) {
      onToast("لطفا متن را وارد کنید", "error");
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === "decode"
          ? await decodeBase64(input.trim())
          : await encodeBase64(input.trim());
      setOutput(result);
      onToast(`${mode === "decode" ? "دیکد" : "انکد"} با موفقیت انجام شد!`, "success");
    } catch (err) {
      onToast(
        `خطا: ${err instanceof Error ? err.message : "مشکل ناشناخته"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSwap() {
    setInput(output);
    setOutput(input);
    setMode(mode === "decode" ? "encode" : "decode");
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="bg-surface-light rounded-xl border border-gray-700/50 p-5">
        <h2 className="text-base font-bold text-white mb-4">ابزار Base64</h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("decode")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "decode"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            🔓 Decode (دیکد)
          </button>
          <button
            onClick={() => setMode("encode")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "encode"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            🔐 Encode (انکد)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400">
                {mode === "decode" ? "متن Base64" : "متن اصلی"}
              </label>
              <button
                onClick={() => setInput("")}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                پاک کردن
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
              className="code-block w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary resize-none"
              dir="ltr"
              placeholder={
                mode === "decode"
                  ? "متن Base64 را اینجا وارد کنید..."
                  : "متن اصلی را اینجا وارد کنید..."
              }
            />
          </div>

          {/* Output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400">
                {mode === "decode" ? "متن دیکد شده" : "متن انکد شده"}
              </label>
              <button
                onClick={() => {
                  if (output) {
                    copyToClipboard(output);
                    onToast("کپی شد!", "success");
                  }
                }}
                disabled={!output}
                className="text-xs text-gray-500 hover:text-gray-300 disabled:opacity-40"
              >
                📋 کپی
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              rows={10}
              className="code-block w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-green-400 placeholder-gray-600 focus:outline-none resize-none"
              dir="ltr"
              placeholder="نتیجه اینجا نمایش داده می‌شود..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleProcess}
            disabled={loading || !input.trim()}
            className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading
              ? "..."
              : mode === "decode"
              ? "🔓 Decode"
              : "🔐 Encode"}
          </button>
          <button
            onClick={handleSwap}
            disabled={!output}
            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-colors disabled:opacity-40"
          >
            🔄 جابجا
          </button>
        </div>
      </div>
    </div>
  );
}
