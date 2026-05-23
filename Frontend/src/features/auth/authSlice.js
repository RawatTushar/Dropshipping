import { createSlice } from '@reduxjs/toolkit';
import { clearUserSession, loadUserSession, persistUserSession } from '../../utils/authSession';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadUserSession(),
    /** False until GET /auth/me finishes (validates httpOnly cookie). */
    sessionReady: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      const payload = action.payload || {};
      const user = {
        _id: payload._id != null ? String(payload._id) : '',
        name: payload.name || '',
        email: payload.email || '',
        isAdmin: Boolean(payload.isAdmin),
      };

      state.user = user._id || user.email ? user : null;
      if (state.user) persistUserSession(user);
      else clearUserSession();
    },
    setSessionReady: (state) => {
      state.sessionReady = true;
    },
    logout: (state) => {
      state.user = null;
      clearUserSession();
    },
  },
});

export const { setCredentials, setSessionReady, logout } = authSlice.actions;
export const selectAuthUser = (state) => state.auth.user;
export const selectSessionReady = (state) => state.auth.sessionReady;
export const selectIsAuthenticated = (state) =>
  Boolean(state.auth.user?._id || state.auth.user?.email);
export const selectCurrentUserId = (state) =>
  state.auth.user?._id || state.auth.user?.email || 'guest';

export default authSlice.reducer;
