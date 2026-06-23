import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { authAPI } from '../api/api';
import { logout, setCredentials, setSessionReady } from '../features/auth/authSlice';
import {
  clearUserSession,
  loadUserSession,
  persistUserSession,
  purgeStoredTokens,
} from '../utils/authSession';
import { clearAccessToken } from '../utils/authMemory';

/**
 * Validates session via GET /auth/me (cookie + optional in-memory Bearer).
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
        clearAccessToken();
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
          const cached = loadUserSession();
          if (cached) {
            dispatch(setCredentials(cached));
          }
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
