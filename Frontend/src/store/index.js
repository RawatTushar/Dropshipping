import { configureStore } from '@reduxjs/toolkit';
import productsReducer, { fetchProducts } from '../features/products/productsSlice';
import cartReducer from '../features/cart/cartSlice';
import ordersReducer from '../features/orders/ordersSlice';
import authReducer from '../features/auth/authSlice';
import currencyReducer from '../features/preferences/currencySlice';
import { mergeGuestCartIntoUserBucket } from '../utils/cartMerge';

const CART_STORAGE_KEY = 'shipit_cart_v1';

/**
 * When a session token exists, merge any guest cart into the logged-in user's bucket
 * so refresh / return visits show the same cart as after login (same keys as selectCurrentUserId).
 */
function loadPersistedCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return undefined;
    let byUser = JSON.parse(raw);
    if (!byUser || typeof byUser !== 'object' || Array.isArray(byUser)) return undefined;

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId') || '';
    const email = localStorage.getItem('userEmail') || '';
    const userKey = userId || email;

    if (token && userKey) {
      byUser = mergeGuestCartIntoUserBucket(byUser, userKey);
    }

    return { cart: { byUser } };
  } catch {
    /* ignore corrupt storage */
  }
  return undefined;
}

const preloaded = loadPersistedCart();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    currency: currencyReducer,
  },
  ...(preloaded ? { preloadedState: preloaded } : {}),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat((api) => (next) => (action) => {
      const result = next(action);
      if (action.type === 'orders/cancelOrder/fulfilled') {
        api.dispatch(fetchProducts());
      }
      return result;
    }),
});

let lastSerialized = '';
store.subscribe(() => {
  try {
    const byUser = store.getState().cart.byUser;
    const next = JSON.stringify(byUser);
    if (next === lastSerialized) return;
    lastSerialized = next;
    localStorage.setItem(CART_STORAGE_KEY, next);
  } catch {
    /* quota / private mode */
  }
});
