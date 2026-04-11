import { createSlice } from '@reduxjs/toolkit';
import { clearUserSession, loadUserSession, persistUserSession } from '../../utils/authSession';

const initialUser = loadUserSession();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
  },
  reducers: {
    setCredentials: (state, action) => {
      const payload = action.payload || {};
      const user = {
        token: payload.token || '',
        _id: payload._id || '',
        name: payload.name || '',
        email: payload.email || '',
        isAdmin: Boolean(payload.isAdmin),
      };

      state.user = user.token ? user : null;
      if (state.user) persistUserSession(user);
      else clearUserSession();
    },
    logout: (state) => {
      state.user = null;
      clearUserSession();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.user?.token || '';
export const selectCurrentUserId = (state) =>
  state.auth.user?._id || state.auth.user?.email || 'guest';

export default authSlice.reducer;
