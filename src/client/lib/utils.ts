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
      () => fallbackCopy(text)
    );
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text: string): boolean {
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(el);
  return ok;
}

export function getProtocolColor(protocol: string): string {
  const colors: Record<string, string> = {
    vmess: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    vless: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    trojan: "bg-red-500/20 text-red-400 border-red-500/30",
    ss: "bg-green-500/20 text-green-400 border-green-500/30",
    hysteria2: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    hy2: "bg-orange-500/20 text-orange-400 border-orange-500/30",
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
    hy2: "H2",
  };
  return icons[protocol] || "?";
}

export function getNetworkBadge(network: string): string {
  return network?.toUpperCase() || "TCP";
}

/**
 * Generate a shareable proxy link for a subscription
 */
export function generateProxyLink(
  subUrl: string,
  format: string = "raw"
): string {
  const base = window.location.origin;
  return `${base}/sub?link=${encodeURIComponent(subUrl)}&format=${format}`;
}

/**
 * Generate a QR code data URL using a free API
 * (No dependencies needed - uses a canvas approach)
 */
export function getQRCodeUrl(text: string, size = 256): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=svg`;
}

/**
 * Detect the protocol from a URI string
 */
export function detectProtocol(uri: string): string | null {
  const protocols = ["vmess://", "vless://", "trojan://", "ss://", "ssr://", "hysteria2://", "hy2://"];
  for (const p of protocols) {
    if (uri.startsWith(p)) return p.replace("://", "");
  }
  return null;
}

/**
 * Time ago format
 */
export function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) {
    const futureDays = Math.abs(days);
    if (futureDays === 0) return "امروز";
    if (futureDays === 1) return "فردا";
    return `${futureDays} روز دیگر`;
  }

  if (days === 0) return "امروز";
  if (days === 1) return "دیروز";
  return `${days} روز پیش`;
}
