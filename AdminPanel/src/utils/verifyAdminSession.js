import { authMe } from '../shared/lib/adminApi';

/**
 * @returns {Promise<{ ok: true, user: object } | { ok: false, message: string }>}
 */
export async function verifyAdminSession() {
  try {
    const { data } = await authMe();
    if (!data?.isAdmin) {
      return {
        ok: false,
        message:
          'This account is not an admin. On EC2 run: docker compose exec backend node src/scripts/promoteAdmin.js your@email.com',
      };
    }
    return { ok: true, user: data };
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      return {
        ok: false,
        message:
          'Admin login succeeded but the secure session cookie was not saved. Use http://your-ip/admin/ (same host as /api). On HTTP set COOKIE_SECURE=false.',
      };
    }
    return {
      ok: false,
      message: err.response?.data?.message || 'Could not verify admin session.',
    };
  }
}
