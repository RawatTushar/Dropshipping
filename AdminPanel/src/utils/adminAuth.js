export const ADMIN_STORAGE_KEY = 'adminInfo';

export const getAdminInfo = () => {
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    return null;
  }
};

export const isAdminUser = (user) => Boolean(user?.isAdmin);

export const setAdminInfo = (user) => {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
};

export const clearAdminInfo = () => {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
};

export const getAuthConfig = () => {
  const admin = getAdminInfo();
  if (!admin?.token) return null;

  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${admin.token}`,
    },
  };
};
