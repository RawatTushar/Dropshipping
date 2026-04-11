/** Default storefront display name (must match branding across the app). */
export const DEFAULT_STORE_NAME = 'SHIPITWITHME';

export const storeNameStorageKey = (userId) => `storeName:${userId}`;

export function readSavedStoreName(userId) {
  if (typeof localStorage === 'undefined') return DEFAULT_STORE_NAME;
  const raw = localStorage.getItem(storeNameStorageKey(userId));
  return raw && raw.trim() !== '' ? raw.trim() : DEFAULT_STORE_NAME;
}
