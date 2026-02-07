/**
 * V2Ray Configuration Parser
 *
 * Parses various V2Ray protocol URIs:
 * - vmess://   (VMess)
 * - vless://   (VLESS)
 * - trojan://  (Trojan)
 * - ss://      (Shadowsocks)
 * - ssr://     (ShadowsocksR)
 * - hysteria2:// / hy2:// (Hysteria2)
 */

export interface V2RayConfig {
  protocol: string;
  name: string;
  address: string;
  port: number;
  raw: string;
  // Protocol-specific fields
  id?: string;
  alterId?: number;
  security?: string;
  network?: string;
  type?: string;
  host?: string;
  path?: string;
  tls?: string;
  sni?: string;
  fingerprint?: string;
  alpn?: string;
  // Shadowsocks
  method?: string;
  password?: string;
  // Trojan
  flow?: string;
  // Extra
  [key: string]: unknown;
}

function safeDecodeBase64(str: string): string {
  try {
    // Handle URL-safe base64
    let s = str.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding
    while (s.length % 4 !== 0) s += "=";
    return atob(s);
  } catch {
    return str;
  }
}

function parseVmess(uri: string): V2RayConfig | null {
  try {
    const encoded = uri.replace("vmess://", "");
    const decoded = safeDecodeBase64(encoded);
    const json = JSON.parse(decoded);
    return {
      protocol: "vmess",
      name: json.ps || json.remark || "VMess",
      address: json.add || "",
      port: Number(json.port) || 0,
      id: json.id || "",
      alterId: Number(json.aid) || 0,
      security: json.scy || "auto",
      network: json.net || "tcp",
      type: json.type || "none",
      host: json.host || "",
      path: json.path || "",
      tls: json.tls || "",
      sni: json.sni || "",
      fingerprint: json.fp || "",
      alpn: json.alpn || "",
      raw: uri,
    };
  } catch {
    return null;
  }
}

function parseStandardUri(
  uri: string,
  protocol: string
): V2RayConfig | null {
  try {
    // Format: protocol://uuid@host:port?params#name
    const withoutProto = uri.replace(`${protocol}://`, "");
    const [mainPart, fragment] = withoutProto.split("#");
    const name = fragment ? decodeURIComponent(fragment) : protocol.toUpperCase();

    const [userHost, queryString] = mainPart.split("?");
    const params = new URLSearchParams(queryString || "");

    let id = "";
    let address = "";
    let port = 0;

    if (userHost.includes("@")) {
      const [user, hostPort] = userHost.split("@");
      id = decodeURIComponent(user);
      const lastColon = hostPort.lastIndexOf(":");
      if (lastColon !== -1) {
        address = hostPort.substring(0, lastColon);
        port = Number(hostPort.substring(lastColon + 1)) || 0;
      }
    }

    // Strip brackets from IPv6
    address = address.replace(/^\[|\]$/g, "");

    return {
      protocol,
      name,
      address,
      port,
      id,
      security: params.get("security") || params.get("encryption") || "",
      network: params.get("type") || params.get("network") || "tcp",
      host: params.get("host") || "",
      path: params.get("path") || "",
      tls: params.get("security") || "",
      sni: params.get("sni") || "",
      fingerprint: params.get("fp") || "",
      alpn: params.get("alpn") || "",
      flow: params.get("flow") || "",
      type: params.get("headerType") || params.get("type") || "",
      raw: uri,
    };
  } catch {
    return null;
  }
}

function parseShadowsocks(uri: string): V2RayConfig | null {
  try {
    const withoutProto = uri.replace("ss://", "");
    const [mainPart, fragment] = withoutProto.split("#");
    const name = fragment ? decodeURIComponent(fragment) : "Shadowsocks";

    let method = "";
    let password = "";
    let address = "";
    let port = 0;

    if (mainPart.includes("@")) {
      // New format: base64(method:pass)@host:port
      const [encoded, hostPort] = mainPart.split("@");
      const decoded = safeDecodeBase64(encoded);
      const colonIdx = decoded.indexOf(":");
      method = decoded.substring(0, colonIdx);
      password = decoded.substring(colonIdx + 1);

      const [queryPart] = hostPort.split("?");
      const lastColon = queryPart.lastIndexOf(":");
      address = queryPart.substring(0, lastColon);
      port = Number(queryPart.substring(lastColon + 1)) || 0;
    } else {
      // Old format: base64(method:pass@host:port)
      const decoded = safeDecodeBase64(mainPart.split("?")[0]);
      const atIdx = decoded.lastIndexOf("@");
      const methodPass = decoded.substring(0, atIdx);
      const hostPort = decoded.substring(atIdx + 1);
      const colonIdx = methodPass.indexOf(":");
      method = methodPass.substring(0, colonIdx);
      password = methodPass.substring(colonIdx + 1);
      const lastColon = hostPort.lastIndexOf(":");
      address = hostPort.substring(0, lastColon);
      port = Number(hostPort.substring(lastColon + 1)) || 0;
    }

    address = address.replace(/^\[|\]$/g, "");

    return {
      protocol: "ss",
      name,
      address,
      port,
      method,
      password,
      raw: uri,
    };
  } catch {
    return null;
  }
}

function parseHysteria2(uri: string): V2RayConfig | null {
  try {
    const withoutProto = uri.replace(/^(hysteria2|hy2):\/\//, "");
    return parseStandardUri(`hy2://${withoutProto}`, "hysteria2");
  } catch {
    return null;
  }
}

export function parseConfig(uri: string): V2RayConfig | null {
  const trimmed = uri.trim();
  if (trimmed.startsWith("vmess://")) return parseVmess(trimmed);
  if (trimmed.startsWith("vless://")) return parseStandardUri(trimmed, "vless");
  if (trimmed.startsWith("trojan://")) return parseStandardUri(trimmed, "trojan");
  if (trimmed.startsWith("ss://")) return parseShadowsocks(trimmed);
  if (trimmed.startsWith("hysteria2://") || trimmed.startsWith("hy2://"))
    return parseHysteria2(trimmed);
  return null;
}

export function parseSubscription(content: string): V2RayConfig[] {
  // Try base64 decode first
  let text = content.trim();
  try {
    const decoded = safeDecodeBase64(text);
    // If decoded looks like URIs, use it
    if (
      decoded.includes("vmess://") ||
      decoded.includes("vless://") ||
      decoded.includes("trojan://") ||
      decoded.includes("ss://") ||
      decoded.includes("hysteria2://") ||
      decoded.includes("hy2://")
    ) {
      text = decoded;
    }
  } catch {
    // Not base64, use as-is
  }

  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const configs: V2RayConfig[] = [];

  for (const line of lines) {
    const config = parseConfig(line.trim());
    if (config) configs.push(config);
  }

  return configs;
}
