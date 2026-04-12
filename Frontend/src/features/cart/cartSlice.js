import { createSlice } from '@reduxjs/toolkit';
import { logout, setCredentials } from '../auth/authSlice';
import { mergeGuestCartIntoUserBucket } from '../../utils/cartMerge';

const getUserId = (state, providedUserId) =>
  providedUserId ||
  state.auth?.user?._id ||
  state.auth?.user?.email ||
  'guest';

const getReadableUserId = (state, preferredUserId) => {
  const byUser = state.cart?.byUser || {};
  const preferredItems = byUser[preferredUserId] || [];
  if (preferredItems.length > 0) return preferredUserId;

  // Fallback for sessions where cart was added before auth user key resolved.
  if (preferredUserId !== 'guest' && (byUser.guest || []).length > 0) {
    return 'guest';
  }

  return preferredUserId;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    byUser: {},
  },
  reducers: {
    addToCart: (state, action) => {
      const userId = getUserId(state, action.payload?.userId);
      if (!state.byUser[userId]) state.byUser[userId] = [];
      const userItems = state.byUser[userId];
      const incoming = action.payload;
      const existing = userItems.find((item) => item._id === incoming._id);

      if (existing) {
        const maxStock = Number(existing.countInStock ?? incoming.countInStock ?? 99);
        existing.qty = Math.min(existing.qty + 1, Math.max(1, maxStock));
      } else {
        userItems.push({
          _id: incoming._id,
          name: incoming.name,
          price: Number(incoming.price || 0),
          image: incoming.image,
          countInStock: Number(incoming.countInStock ?? 0),
          qty: 1,
        });
      }
    },

    updateCartQty: (state, action) => {
      const { productId, qty, userId: payloadUserId } = action.payload;
      const userId = getUserId(state, payloadUserId);
      const userItems = state.byUser[userId] || [];
      const item = userItems.find((i) => i._id === productId);
      if (!item) return;

      const stock = Math.max(1, Number(item.countInStock ?? 1));
      item.qty = Math.min(Math.max(1, Number(qty || 1)), stock);
    },

    removeFromCart: (state, action) => {
      const userId = getUserId(state, action.payload?.userId);
      const productId = action.payload?.productId ?? action.payload;
      state.byUser[userId] = (state.byUser[userId] || []).filter(
        (item) => item._id !== productId
      );
    },

    removeOneFromCart: (state, action) => {
      const userId = getUserId(state, action.payload?.userId);
      const productId = action.payload?.productId ?? action.payload;
      const userItems = state.byUser[userId] || [];
      const item = userItems.find((i) => i._id === productId);
      if (!item) return;

      if (item.qty > 1) {
        item.qty -= 1;
      } else {
        state.byUser[userId] = userItems.filter((i) => i._id !== productId);
      }
    },

    clearCart: (state, action) => {
      const userId = getUserId(state, action.payload?.userId);
      state.byUser[userId] = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setCredentials, (state, action) => {
        const nextUserId =
          action.payload?._id || action.payload?.email || '';
        if (!nextUserId) return;

        state.byUser = mergeGuestCartIntoUserBucket(state.byUser, nextUserId);
      })
      // Do not clear cart on logout: `byUser` is keyed per account (and `guest`).
      // Clearing wiped localStorage via the store subscriber and broke login restore.
      // When logged out, selectors use the `guest` bucket; signed-in users see their own key again.
      .addCase(logout, (_state) => {
        /* no-op: preserve cart.byUser for per-user persistence */
      });
  },
});

export const {
  addToCart,
  updateCartQty,
  removeFromCart,
  removeOneFromCart,
  clearCart,
} = cartSlice.actions;

export const selectCartItems = (state) => {
  const userId = getReadableUserId(state, getUserId(state));
  return state.cart.byUser[userId] || [];
};
export const selectCartItemsByUser = (state, userId) =>
  state.cart.byUser[getReadableUserId(state, userId || getUserId(state))] || [];
export const selectCartCountByUser = (state, userId) =>
  selectCartItemsByUser(state, userId).reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  );
export const selectCartSubtotalByUser = (state, userId) =>
  selectCartItemsByUser(state, userId).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
    0
  );
export const selectCartCount = (state) =>
  selectCartItems(state).reduce((sum, item) => sum + Number(item.qty || 0), 0);
export const selectCartSubtotal = (state) =>
  selectCartItems(state).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
    0
  );

export default cartSlice.reducer;
