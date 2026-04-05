export function persistUserSession({ token, name, email, isAdmin }) {
  if (token != null) localStorage.setItem('token', token);
  if (name != null && name !== '') localStorage.setItem('userName', name);
  if (email != null && email !== '') localStorage.setItem('userEmail', email);
  if (isAdmin != null) localStorage.setItem('isAdmin', String(isAdmin));
}

export function clearUserSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isAdmin');
}
