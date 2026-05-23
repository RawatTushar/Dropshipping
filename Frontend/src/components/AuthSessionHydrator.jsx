import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { authAPI } from '../api/api';
import { logout, setCredentials, setSessionReady } from '../features/auth/authSlice';
import { clearUserSession, persistUserSession } from '../utils/authSession';

/**
 * On every load, validates the httpOnly auth cookie via GET /auth/me and syncs Redux.
 * Works for email login, OTP, magic link, and Google (cookie-only, no localStorage yet).
 */
const AuthSessionHydrator = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await authAPI.me();
        if (cancelled) return;
        persistUserSession({
          _id: data._id,
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
        });
        dispatch(
          setCredentials({
            _id: data._id,
            name: data.name,
            email: data.email,
            isAdmin: data.isAdmin,
          }),
        );
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        // Only clear session when the server rejects auth — not on network blips.
        if (status === 401 || status === 403) {
          clearUserSession();
          dispatch(logout());
        }
      } finally {
        if (!cancelled) dispatch(setSessionReady());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
};

export default AuthSessionHydrator;
