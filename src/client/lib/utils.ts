/**
 * Utility functions
 */

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => false
    );
  }
  // Fallback
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(el);
  return Promise.resolve(ok);
}

export function getProtocolColor(protocol: string): string {
  const colors: Record<string, string> = {
    vmess: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    vless: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    trojan: "bg-red-500/20 text-red-400 border-red-500/30",
    ss: "bg-green-500/20 text-green-400 border-green-500/30",
    hysteria2: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };
  return colors[protocol] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

export function getProtocolIcon(protocol: string): string {
  const icons: Record<string, string> = {
    vmess: "V",
    vless: "VL",
    trojan: "T",
    ss: "SS",
    hysteria2: "H2",
  };
  return icons[protocol] || "?";
}

export function getNetworkBadge(network: string): string {
  return network?.toUpperCase() || "TCP";
}
