/**
 * V2Ray Config Converter
 *
 * Converts parsed configs to various client formats:
 * - Clash (YAML)
 * - Surge
 * - Quantumult X
 * - Sing-box (JSON)
 * - Base64 subscription
 * - JSON export
 */

import { V2RayConfig } from "./parser";

// ─── Clash Format ────────────────────────────────────────────

function toClashProxy(c: V2RayConfig): Record<string, unknown> | null {
  switch (c.protocol) {
    case "vmess":
      return {
        name: c.name,
        type: "vmess",
        server: c.address,
        port: c.port,
        uuid: c.id,
        alterId: c.alterId || 0,
        cipher: c.security || "auto",
        network: c.network || "tcp",
        tls: c.tls === "tls",
        ...(c.sni ? { servername: c.sni } : {}),
        ...(c.network === "ws"
          ? {
              "ws-opts": {
                path: c.path || "/",
                ...(c.host ? { headers: { Host: c.host } } : {}),
              },
            }
          : {}),
        ...(c.network === "grpc"
          ? { "grpc-opts": { "grpc-service-name": c.path || "" } }
          : {}),
      };
    case "vless":
      return {
        name: c.name,
        type: "vless",
        server: c.address,
        port: c.port,
        uuid: c.id,
        network: c.network || "tcp",
        tls: c.tls === "tls" || c.tls === "reality",
        ...(c.flow ? { flow: c.flow } : {}),
        ...(c.sni ? { servername: c.sni } : {}),
        ...(c.tls === "reality"
          ? {
              "reality-opts": {
                "public-key": c.fingerprint || "",
                "short-id": "",
              },
            }
          : {}),
        ...(c.network === "ws"
          ? {
              "ws-opts": {
                path: c.path || "/",
                ...(c.host ? { headers: { Host: c.host } } : {}),
              },
            }
          : {}),
      };
    case "trojan":
      return {
        name: c.name,
        type: "trojan",
        server: c.address,
        port: c.port,
        password: c.id,
        ...(c.sni ? { sni: c.sni } : {}),
        ...(c.network === "ws"
          ? {
              network: "ws",
              "ws-opts": {
                path: c.path || "/",
                ...(c.host ? { headers: { Host: c.host } } : {}),
              },
            }
          : {}),
      };
    case "ss":
      return {
        name: c.name,
        type: "ss",
        server: c.address,
        port: c.port,
        cipher: c.method || "aes-256-gcm",
        password: c.password || "",
      };
    case "hysteria2":
      return {
        name: c.name,
        type: "hysteria2",
        server: c.address,
        port: c.port,
        password: c.id,
        ...(c.sni ? { sni: c.sni } : {}),
      };
    default:
      return null;
  }
}

export function toClash(configs: V2RayConfig[]): string {
  const proxies = configs.map(toClashProxy).filter(Boolean);
  const names = configs.map((c) => c.name);

  const clashConfig = {
    port: 7890,
    "socks-port": 7891,
    "allow-lan": false,
    mode: "rule",
    "log-level": "info",
    proxies,
    "proxy-groups": [
      {
        name: "PROXY",
        type: "select",
        proxies: ["auto", ...names],
      },
      {
        name: "auto",
        type: "url-test",
        proxies: names,
        url: "http://www.gstatic.com/generate_204",
        interval: 300,
      },
    ],
    rules: [
      "GEOIP,IR,DIRECT",
      "GEOIP,CN,DIRECT",
      "MATCH,PROXY",
    ],
  };

  // Simple YAML serializer (no dependency needed)
  return toYaml(clashConfig);
}

function toYaml(obj: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "boolean") return obj.toString();
  if (typeof obj === "number") return obj.toString();
  if (typeof obj === "string") {
    if (obj.includes(":") || obj.includes("#") || obj.includes("'") || obj.includes('"') || obj.includes("\n") || obj.match(/^\s/) || obj.match(/\s$/)) {
      return `"${obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map((item) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          const entries = Object.entries(item);
          if (entries.length === 0) return `${pad}- {}`;
          const [firstKey, firstVal] = entries[0];
          let result = `${pad}- ${firstKey}: ${toYaml(firstVal, indent + 2)}`;
          for (let i = 1; i < entries.length; i++) {
            const [k, v] = entries[i];
            result += `\n${pad}  ${k}: ${toYaml(v, indent + 2)}`;
          }
          return result;
        }
        return `${pad}- ${toYaml(item, indent + 1)}`;
      })
      .join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          if (Array.isArray(value) && value.length > 0) {
            return `${pad}${key}:\n${toYaml(value, indent + 1)}`;
          }
          if (!Array.isArray(value) && Object.keys(value).length > 0) {
            return `${pad}${key}:\n${toYaml(value, indent + 1)}`;
          }
          return `${pad}${key}: ${Array.isArray(value) ? "[]" : "{}"}`;
        }
        return `${pad}${key}: ${toYaml(value, indent)}`;
      })
      .join("\n");
  }
  return String(obj);
}

// ─── Sing-box Format ─────────────────────────────────────────

function toSingboxOutbound(c: V2RayConfig): Record<string, unknown> | null {
  const base = { tag: c.name, server: c.address, server_port: c.port };

  switch (c.protocol) {
    case "vmess":
      return {
        ...base,
        type: "vmess",
        uuid: c.id,
        alter_id: c.alterId || 0,
        security: c.security || "auto",
        ...(c.tls === "tls" ? { tls: { enabled: true, server_name: c.sni || c.address } } : {}),
        ...(c.network === "ws"
          ? { transport: { type: "ws", path: c.path || "/", headers: c.host ? { Host: c.host } : {} } }
          : {}),
      };
    case "vless":
      return {
        ...base,
        type: "vless",
        uuid: c.id,
        ...(c.flow ? { flow: c.flow } : {}),
        ...(c.tls
          ? {
              tls: {
                enabled: true,
                server_name: c.sni || c.address,
                ...(c.tls === "reality"
                  ? { reality: { enabled: true, public_key: c.fingerprint || "" } }
                  : {}),
              },
            }
          : {}),
        ...(c.network === "ws"
          ? { transport: { type: "ws", path: c.path || "/" } }
          : {}),
        ...(c.network === "grpc"
          ? { transport: { type: "grpc", service_name: c.path || "" } }
          : {}),
      };
    case "trojan":
      return {
        ...base,
        type: "trojan",
        password: c.id,
        tls: { enabled: true, server_name: c.sni || c.address },
      };
    case "ss":
      return {
        ...base,
        type: "shadowsocks",
        method: c.method || "aes-256-gcm",
        password: c.password || "",
      };
    case "hysteria2":
      return {
        ...base,
        type: "hysteria2",
        password: c.id,
        tls: { enabled: true, server_name: c.sni || c.address },
      };
    default:
      return null;
  }
}

export function toSingbox(configs: V2RayConfig[]): string {
  const outbounds = configs.map(toSingboxOutbound).filter(Boolean);
  const tags = configs.map((c) => c.name);

  const singboxConfig = {
    log: { level: "info" },
    inbounds: [
      { type: "mixed", tag: "mixed-in", listen: "127.0.0.1", listen_port: 2080 },
    ],
    outbounds: [
      { type: "selector", tag: "proxy", outbounds: ["auto", ...tags] },
      { type: "urltest", tag: "auto", outbounds: tags, url: "http://www.gstatic.com/generate_204", interval: "3m" },
      ...outbounds,
      { type: "direct", tag: "direct" },
      { type: "block", tag: "block" },
    ],
    route: {
      rules: [
        { geoip: ["ir", "cn"], outbound: "direct" },
        { geosite: ["category-ir"], outbound: "direct" },
      ],
      final: "proxy",
    },
  };

  return JSON.stringify(singboxConfig, null, 2);
}

// ─── Quantumult X Format ─────────────────────────────────────

export function toQuantumultX(configs: V2RayConfig[]): string {
  const lines: string[] = ["[server_local]"];

  for (const c of configs) {
    switch (c.protocol) {
      case "vmess":
        lines.push(
          `vmess=${c.address}:${c.port}, method=${c.security || "auto"}, password=${c.id}, tag=${c.name}` +
            (c.tls === "tls" ? `, obfs=over-tls, obfs-host=${c.sni || c.address}` : "") +
            (c.network === "ws" ? `, obfs=ws, obfs-uri=${c.path || "/"}` : "")
        );
        break;
      case "trojan":
        lines.push(
          `trojan=${c.address}:${c.port}, password=${c.id}, over-tls=true, tls-host=${c.sni || c.address}, tag=${c.name}`
        );
        break;
      case "ss":
        lines.push(
          `shadowsocks=${c.address}:${c.port}, method=${c.method}, password=${c.password}, tag=${c.name}`
        );
        break;
    }
  }

  return lines.join("\n");
}

// ─── Surge Format ────────────────────────────────────────────

export function toSurge(configs: V2RayConfig[]): string {
  const lines: string[] = ["[Proxy]"];

  for (const c of configs) {
    switch (c.protocol) {
      case "vmess":
        lines.push(
          `${c.name} = vmess, ${c.address}, ${c.port}, username=${c.id}` +
            (c.tls === "tls" ? `, tls=true, sni=${c.sni || c.address}` : "") +
            (c.network === "ws" ? `, ws=true, ws-path=${c.path || "/"}` : "")
        );
        break;
      case "trojan":
        lines.push(
          `${c.name} = trojan, ${c.address}, ${c.port}, password=${c.id}, sni=${c.sni || c.address}`
        );
        break;
      case "ss":
        lines.push(
          `${c.name} = ss, ${c.address}, ${c.port}, encrypt-method=${c.method}, password=${c.password}`
        );
        break;
    }
  }

  return lines.join("\n");
}

// ─── Base64 Re-encode ────────────────────────────────────────

export function toBase64Sub(configs: V2RayConfig[]): string {
  const raw = configs.map((c) => c.raw).join("\n");
  return btoa(raw);
}

// ─── JSON Export ─────────────────────────────────────────────

export function toJSON(configs: V2RayConfig[]): string {
  return JSON.stringify(
    configs.map(({ raw, ...rest }) => rest),
    null,
    2
  );
}
