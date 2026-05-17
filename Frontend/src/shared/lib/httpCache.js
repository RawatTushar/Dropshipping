/** In-memory GET cache (per tab). Complements browser Cache-Control + Redux stale checks. */

const store = new Map();

export const CACHE_TTL = {
  products: 2 * 60 * 1000,
  productDetail: 2 * 60 * 1000,
  orders: 30 * 1000,
  paymentsConfig: 5 * 60 * 1000,
};

function cacheKey(url, params) {
  if (!params || !Object.keys(params).length) return url;
  const qs = new URLSearchParams(params).toString();
  return qs ? `${url}?${qs}` : url;
}

export function readHttpCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function writeHttpCache(key, data, ttlMs) {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function invalidateHttpCache(urlPrefix = '') {
  if (!urlPrefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(urlPrefix)) store.delete(key);
  }
}

/**
 * Cached GET for axios instance. Returns axios-shaped `{ data }`.
 * @param {import('axios').AxiosInstance} client
 */
export async function cachedGet(client, url, { params, ttlMs, force = false } = {}) {
  const key = cacheKey(url, params);
  if (!force) {
    const hit = readHttpCache(key);
    if (hit !== null) return { data: hit, cached: true };
  }

  const response = await client.get(url, { params });
  writeHttpCache(key, response.data, ttlMs);
  return { data: response.data, cached: false };
}
