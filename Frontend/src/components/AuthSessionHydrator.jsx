import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { authAPI } from '../api/api';
import { logout, setCredentials, setSessionReady } from '../features/auth/authSlice';
import { clearUserSession, persistUserSession, purgeStoredTokens } from '../utils/authSession';

/**
 * Validates the httpOnly session cookie via GET /auth/me (withCredentials).
 * No JWT in localStorage — cookie cannot be read by JavaScript (XSS-safe).
 */
const AuthSessionHydrator = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    purgeStoredTokens();

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
