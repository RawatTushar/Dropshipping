import { invalidateHttpCache } from '../shared/lib/httpCache';

/** Old insecure storage — removed on load; JWT must only live in httpOnly cookie. */
const LEGACY_TOKEN_KEYS = ['authToken', 'authTokenEnc'];

/** Drop any JWT from localStorage (XSS-safe auth uses httpOnly `shipit_auth` cookie only). */
export function purgeStoredTokens() {
  for (const key of LEGACY_TOKEN_KEYS) {
    localStorage.removeItem(key);
  }
}

/** Non-sensitive profile for UI; not used for API authorization. */
export function persistUserSession({ _id, name, email, isAdmin }) {
  if (_id != null && _id !== '') localStorage.setItem('userId', _id);
  if (name != null && name !== '') localStorage.setItem('userName', name);
  if (email != null && email !== '') localStorage.setItem('userEmail', email);
  if (isAdmin != null) localStorage.setItem('isAdmin', String(isAdmin));
}

export function loadUserSession() {
  const _id = localStorage.getItem('userId') || '';
  const email = localStorage.getItem('userEmail') || '';
  if (!_id && !email) return null;

  return {
    _id,
    name: localStorage.getItem('userName') || '',
    email,
    isAdmin: localStorage.getItem('isAdmin') === 'true',
  };
}

export function clearUserSession() {
  invalidateHttpCache();
  purgeStoredTokens();
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isAdmin');
}
