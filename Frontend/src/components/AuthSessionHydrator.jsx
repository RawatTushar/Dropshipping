import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { authAPI } from '../api/api';
import { logout, setCredentials } from '../features/auth/authSlice';
import { clearUserSession, persistUserSession } from '../utils/authSession';

/** Validates httpOnly cookie via /me and syncs Redux profile from the server. */
const AuthSessionHydrator = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const hasProfile = Boolean(
      localStorage.getItem('userId') || localStorage.getItem('userEmail'),
    );
    if (!hasProfile) return;

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
      } catch {
        if (!cancelled) {
          clearUserSession();
          dispatch(logout());
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
};

export default AuthSessionHydrator;
