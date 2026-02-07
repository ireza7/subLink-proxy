import { SubConfig } from "../lib/api";
import { getProtocolColor, getProtocolIcon, getNetworkBadge, copyToClipboard } from "../lib/utils";

interface ConfigCardProps {
  config: SubConfig;
  index: number;
  onCopy: (msg: string) => void;
}

export function ConfigCard({ config, index, onCopy }: ConfigCardProps) {
  const protocolColor = getProtocolColor(config.protocol);
  const protocolIcon = getProtocolIcon(config.protocol);

  const handleCopyAddress = () => {
    copyToClipboard(`${config.address}:${config.port}`);
    onCopy("آدرس کپی شد!");
  };

  return (
    <div className="animate-fade-in bg-surface-light rounded-xl border border-gray-700/50 hover:border-primary/50 transition-all duration-200 overflow-hidden group">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-700/30">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-mono font-bold text-xs ${protocolColor}`}>
          {protocolIcon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate" dir="ltr">
            {config.name}
          </h3>
          <p className="text-xs text-gray-500 font-mono truncate" dir="ltr">
            {config.address}:{config.port}
          </p>
        </div>
        <span className="text-xs text-gray-600 font-mono">#{index + 1}</span>
      </div>

      {/* Details */}
      <div className="p-4 grid grid-cols-2 gap-2 text-xs" dir="ltr">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Protocol:</span>
          <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${protocolColor}`}>
            {config.protocol.toUpperCase()}
          </span>
        </div>

        {config.network && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Network:</span>
            <span className="text-gray-300">{getNetworkBadge(config.network)}</span>
          </div>
        )}

        {config.tls && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">TLS:</span>
            <span className={config.tls === "tls" || config.tls === "reality" ? "text-green-400" : "text-yellow-400"}>
              {config.tls.toUpperCase()}
            </span>
          </div>
        )}

        {config.security && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Security:</span>
            <span className="text-gray-300">{config.security}</span>
          </div>
        )}

        {config.sni && (
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-gray-500">SNI:</span>
            <span className="text-gray-300 truncate">{config.sni}</span>
          </div>
        )}

        {config.method && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Method:</span>
            <span className="text-gray-300">{config.method}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={handleCopyAddress}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
        >
          کپی آدرس
        </button>
      </div>
    </div>
  );
}
