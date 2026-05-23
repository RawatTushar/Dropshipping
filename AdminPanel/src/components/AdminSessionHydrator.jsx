import { useEffect } from 'react';
import { authMe } from '../shared/lib/adminApi';
import { clearAdminInfo, setAdminInfo } from '../utils/adminAuth';

/** Restores admin UI state from httpOnly cookie via GET /api/auth/me. */
const AdminSessionHydrator = () => {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await authMe();
        if (cancelled) return;
        if (data?.isAdmin) {
          setAdminInfo({
            _id: data._id,
            name: data.name,
            email: data.email,
            isAdmin: true,
          });
        } else {
          clearAdminInfo();
        }
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          clearAdminInfo();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};

export default AdminSessionHydrator;
