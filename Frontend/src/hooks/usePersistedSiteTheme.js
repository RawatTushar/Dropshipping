import { useEffect } from 'react';
import { THEME_STORAGE_KEY, userThemeKey } from '../utils/siteTheme';

/** Keeps `data-theme` and localStorage in sync (same logic everywhere). */
export function usePersistedSiteTheme(theme, userId) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      const perKey = userThemeKey(userId);
      if (perKey) window.localStorage.setItem(perKey, theme);
    } catch {
      /* ignore quota */
    }
  }, [theme, userId]);
}
