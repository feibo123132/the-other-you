let cachedBase: string | null = null;

function getDefaultFallback(): string {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.hostname === 'localhost'
      ? '127.0.0.1'
      : (window.location.hostname || '127.0.0.1');
    return `${protocol}//${host}:8787/api`;
  }
  return 'http://127.0.0.1:8787/api';
}

export async function getApiBase(): Promise<string> {
  if (cachedBase) return cachedBase;
  const envBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  if (envBase && typeof envBase === 'string' && envBase.length > 0) {
    cachedBase = envBase.replace(/\/$/, '');
    return cachedBase;
  }
  // probe vite proxy
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2000);
    const resp = await fetch('/api/health', { signal: ctrl.signal });
    clearTimeout(t);
    if (resp.ok) {
      cachedBase = '/api';
      return cachedBase;
    }
  } catch {}
  cachedBase = getDefaultFallback();
  return cachedBase;
}

export function buildUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}
