let cachedBase: string | null = null;
const PROD_API_BASE = "https://jieyouyuzhou.cn/api";
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isPrivateNetworkHost(hostname: string): boolean {
  return (
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}

function isLocalRuntimeHost(hostname: string): boolean {
  return LOOPBACK_HOSTS.has(hostname) || hostname.endsWith(".local") || isPrivateNetworkHost(hostname);
}

function getDefaultFallback(): string {
  if (typeof window !== "undefined") {
    if (!isLocalRuntimeHost(window.location.hostname)) {
      return PROD_API_BASE;
    }

    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const host = window.location.hostname === "localhost" ? "127.0.0.1" : (window.location.hostname || "127.0.0.1");
    return `${protocol}//${host}:8787/api`;
  }

  return PROD_API_BASE;
}

function shouldProbeViteProxy(): boolean {
  if (typeof window === "undefined") return false;
  const env = (import.meta as any).env;
  return Boolean(env?.DEV) && isLocalRuntimeHost(window.location.hostname);
}

export async function getApiBase(): Promise<string> {
  if (cachedBase) return cachedBase;

  const envBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  if (envBase && typeof envBase === "string" && envBase.length > 0) {
    cachedBase = envBase.replace(/\/$/, "");
    return cachedBase;
  }

  if (shouldProbeViteProxy()) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2000);
      const resp = await fetch("/api/health", { signal: ctrl.signal });
      clearTimeout(t);
      if (resp.ok) {
        cachedBase = "/api";
        return cachedBase;
      }
    } catch {
      // ignore: local proxy may be unavailable
    }
  }

  cachedBase = getDefaultFallback();
  return cachedBase;
}

export function buildUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}
