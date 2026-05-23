export const ADMIN_STORAGE_KEY = 'adminInfo';

/** Profile cache for UI only — auth is httpOnly cookie `shipit_auth`. */
export const getAdminInfo = () => {
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.token) {
      const { token: _removed, ...rest } = parsed;
      return rest;
    }
    return parsed;
  } catch {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    return null;
  }
};

export const isAdminUser = (user) => Boolean(user?.isAdmin);

export const setAdminInfo = (user) => {
  if (!user) return;
  const { token: _removed, ...profile } = user;
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(profile));
};

export const clearAdminInfo = () => {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
};
