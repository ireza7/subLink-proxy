import { SubInfo } from "../lib/api";
import { formatBytes } from "../lib/utils";

interface SubInfoBarProps {
  info: SubInfo;
}

export function SubInfoBar({ info }: SubInfoBarProps) {
  const usedPercent = info.total > 0 ? Math.min(100, (info.used / info.total) * 100) : 0;
  const isExpiringSoon =
    info.expire > 0 &&
    (info.expire * 1000 - Date.now()) / (1000 * 60 * 60 * 24) < 7;

  return (
    <div className="animate-fade-in bg-surface-light rounded-xl border border-gray-700/50 p-5">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">اطلاعات سابسکریپشن</h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>مصرف شده: {formatBytes(info.used)}</span>
          <span>کل: {formatBytes(info.total)}</span>
        </div>
        <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usedPercent > 90
                ? "bg-red-500"
                : usedPercent > 70
                ? "bg-yellow-500"
                : "bg-gradient-to-r from-primary to-accent"
            }`}
            style={{ width: `${usedPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-left" dir="ltr">
          {usedPercent.toFixed(1)}% used
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">آپلود</p>
          <p className="text-sm font-semibold text-blue-400" dir="ltr">{formatBytes(info.upload)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">دانلود</p>
          <p className="text-sm font-semibold text-green-400" dir="ltr">{formatBytes(info.download)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">باقیمانده</p>
          <p className="text-sm font-semibold text-purple-400" dir="ltr">{formatBytes(info.remaining)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">انقضا</p>
          <p className={`text-sm font-semibold ${isExpiringSoon ? "text-red-400" : "text-gray-300"}`} dir="ltr">
            {info.expire > 0
              ? new Date(info.expire * 1000).toLocaleDateString("fa-IR")
              : "نامحدود"}
          </p>
        </div>
      </div>
    </div>
  );
}
