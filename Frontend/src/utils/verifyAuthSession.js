import { authAPI } from '../api/api';

/**
 * After login, confirm the server set the httpOnly session cookie.
 * @returns {Promise<{ ok: true, user: object } | { ok: false, message: string }>}
 */
export async function verifyAuthSession() {
  try {
    const { data } = await authAPI.me();
    return { ok: true, user: data };
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      return {
        ok: false,
        message:
          'Login succeeded but the secure session cookie was not saved. Open the store at your site URL (e.g. http://16.171.37.166/), not :4000. On HTTP, set COOKIE_SECURE=false in backend/.env.',
      };
    }
    return {
      ok: false,
      message:
        err.response?.data?.message ||
        'Could not verify your session. Check that /api is reachable from this page.',
    };
  }
}
