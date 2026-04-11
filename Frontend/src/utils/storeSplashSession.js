const KEY = 'storeSplashPending';

/** Call right before navigating to the dashboard after a successful sign-in. */
export function requestStoreSplash() {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}

export function isStoreSplashPending() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function clearStoreSplash() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
