const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  url: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function getCached(code: string): string | null {
  const entry = cache.get(code);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(code);
    return null;
  }
  return entry.url;
}

export function setCache(code: string, url: string): void {
  cache.set(code, { url, expiresAt: Date.now() + TTL_MS });
}

export function invalidate(code: string): void {
  cache.delete(code);
}
