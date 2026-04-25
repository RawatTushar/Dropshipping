export function persistUserSession({ token, _id, name, email, isAdmin }) {
  // Token is stored in a secure httpOnly cookie by the backend.
  if (_id != null && _id !== '') localStorage.setItem('userId', _id);
  if (name != null && name !== '') localStorage.setItem('userName', name);
  if (email != null && email !== '') localStorage.setItem('userEmail', email);
  if (isAdmin != null) localStorage.setItem('isAdmin', String(isAdmin));
}

export function loadUserSession() {
  return {
    token: '',
    _id: localStorage.getItem('userId') || '',
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
    isAdmin: localStorage.getItem('isAdmin') === 'true',
  };
}

export function clearUserSession() {
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isAdmin');
}
