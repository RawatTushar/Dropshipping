import { useSyncExternalStore } from 'react';

export const THEME_STORAGE_KEY = 'theme';

export function userThemeKey(userId) {
  if (!userId || userId === 'guest') return null;
  return `${THEME_STORAGE_KEY}:${userId}`;
}

/** Read persisted theme: per-user key first, then global. */
export function getStoredThemeForUser(userId) {
  const perKey = userThemeKey(userId);
  if (perKey) {
    const per = window.localStorage.getItem(perKey);
    if (per === 'light' || per === 'dark') return per;
  }
  const global = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (global === 'light' || global === 'dark') return global;
  return 'dark';
}

function getDocumentTheme() {
  const fromDom = document.documentElement.getAttribute('data-theme');
  if (fromDom === 'light' || fromDom === 'dark') return fromDom;
  const g = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (g === 'light' || g === 'dark') return g;
  return 'dark';
}

/** Call once before React mounts to avoid light/dark flash on first paint. */
export function hydrateThemeFromStorage() {
  try {
    const uid = sessionStorage.getItem('userId') || '';
    const userId = uid || 'guest';
    const t = getStoredThemeForUser(userId);
    document.documentElement.setAttribute('data-theme', t);
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

function subscribeTheme(onChange) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  window.addEventListener('storage', onChange);
  return () => {
    mo.disconnect();
    window.removeEventListener('storage', onChange);
  };
}

/** Tracks `data-theme` (kept in sync with localStorage by DashboardLayout). */
export function useSiteTheme() {
  return useSyncExternalStore(subscribeTheme, getDocumentTheme, () => 'dark');
}
