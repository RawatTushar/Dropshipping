import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'currencyPrefsByUser';

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const savePrefs = (prefs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

const getUserId = (state, providedUserId) =>
  providedUserId ||
  state.auth?.user?._id ||
  state.auth?.user?.email ||
  'guest';

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    byUser: loadPrefs(),
  },
  reducers: {
    setCurrencyForUser: (state, action) => {
      const { userId, currency } = action.payload || {};
      if (!userId || !currency) return;
      state.byUser[userId] = currency;
      savePrefs(state.byUser);
    },
  },
});

export const { setCurrencyForUser } = currencySlice.actions;

export const selectCurrentCurrency = (state) => {
  const userId = getUserId(state);
  return state.currency.byUser[userId] || 'USD';
};

export default currencySlice.reducer;
