import { clearAccessToken } from './authMemory';

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
  if (_id != null && _id !== '') sessionStorage.setItem('userId', _id);
  if (name != null && name !== '') sessionStorage.setItem('userName', name);
  if (email != null && email !== '') sessionStorage.setItem('userEmail', email);
  if (isAdmin != null) sessionStorage.setItem('isAdmin', String(isAdmin));
}

export function loadUserSession() {
  const _id = sessionStorage.getItem('userId') || '';
  const email = sessionStorage.getItem('userEmail') || '';
  if (!_id && !email) return null;

  return {
    _id,
    name: sessionStorage.getItem('userName') || '',
    email,
    isAdmin: sessionStorage.getItem('isAdmin') === 'true',
  };
}

export function clearUserSession() {
  purgeStoredTokens();
  clearAccessToken();
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('isAdmin');
}
