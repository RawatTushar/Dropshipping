import { createSlice } from '@reduxjs/toolkit';
import { clearUserSession, loadUserSession, persistUserSession } from '../../utils/authSession';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadUserSession(),
  },
  reducers: {
    setCredentials: (state, action) => {
      const payload = action.payload || {};
      const user = {
        _id: payload._id || '',
        name: payload.name || '',
        email: payload.email || '',
        isAdmin: Boolean(payload.isAdmin),
      };

      state.user = user._id || user.email ? user : null;
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
export const selectIsAuthenticated = (state) =>
  Boolean(state.auth.user?._id || state.auth.user?.email);
export const selectCurrentUserId = (state) =>
  state.auth.user?._id || state.auth.user?.email || 'guest';

export default authSlice.reducer;
