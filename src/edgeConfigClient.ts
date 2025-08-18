export type PageJSON = Record<string, any>;

interface CacheEntry {
  value: PageJSON;
  expires: number; // timestamp in ms
}

const CACHE_TTL_MS = 5000; // 5 seconds
const MAX_CACHE_SIZE = 100;

// Simple LRU cache using Map to preserve insertion order
const cache = new Map<string, CacheEntry>();

// Map of pageId to latest deployed version for cache busting
const pageVersions = new Map<string, string>();

function updateLRU(key: string, entry: CacheEntry) {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, entry);
  if (cache.size > MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
}

export function setPageConfigVersion(pageId: string, version: string) {
  pageVersions.set(pageId, version);
  // Remove existing cache entry so next fetch goes to network
  cache.delete(pageId);
}

export async function fetchPageConfig(pageId: string): Promise<PageJSON> {
  const now = Date.now();
  const cached = cache.get(pageId);
  if (cached && cached.expires > now) {
    updateLRU(pageId, cached);
    return cached.value;
  }

  const version = pageVersions.get(pageId);
  const appendVersion = version ? `?v=${encodeURIComponent(version)}` : '';

  try {
    let data: PageJSON;

    // In production, try fetching directly from Cloudflare KV if credentials are available
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.CF_ACCOUNT_ID &&
      process.env.CF_NAMESPACE_ID &&
      process.env.CF_API_TOKEN
    ) {
      const key = `prod:${pageId}:latest.json`;
      const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_NAMESPACE_ID}/values/${key}`;
      const res = await fetch(kvUrl, {
        headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}` },
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`KV fetch failed: ${res.status}`);
      }
      data = await res.json();
    } else {
      const url = `/edge-config/${pageId}${appendVersion}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status}`);
      }
      data = await res.json();
    }

    updateLRU(pageId, { value: data, expires: now + CACHE_TTL_MS });
    return data;
  } catch (err) {
    if (cached) {
      console.warn(
        `edgeConfigClient: returning stale config for ${pageId} after fetch error`,
        err
      );
      updateLRU(pageId, cached);
      return cached.value;
    }
    throw err;
  }
}

