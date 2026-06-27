import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApiErrorMessage, ordersAPI } from '../../api/api';
import { logout } from '../auth/authSlice';

const getUserId = (state) =>
  state.auth?.user?._id || state.auth?.user?.email || 'guest';

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { rejectWithValue, getState }) => {
    try {
      const userId = getUserId(getState());
      const { data } = await ordersAPI.getAll();
      return {
        userId,
        orders: data,
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load orders.'));
    }
  },
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await ordersAPI.create(payload);
      return data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to place order.'));
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue, getState }) => {
    try {
      await ordersAPI.cancel(orderId);
      return { orderId: String(orderId), userId: getUserId(getState()) };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to cancel order.'));
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, shippingAddress }, { rejectWithValue }) => {
    try {
      const { data } = await ordersAPI.update(orderId, { shippingAddress });
      return data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to update order.'));
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    byUser: {},
    loading: false,
    creating: false,
    error: '',
    createError: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.payload?.userId || 'guest';
        state.byUser[userId] = Array.isArray(action.payload?.orders)
          ? action.payload.orders
          : [];
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load orders.';
      })
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
        state.createError = '';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.creating = false;
        const userId = action.meta?.arg?.userId || 'guest';
        if (!state.byUser[userId]) {
          state.byUser[userId] = [];
        }
        if (action.payload) {
          state.byUser[userId].unshift(action.payload);
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || 'Failed to place order.';
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const { orderId, userId } = action.payload || {};
        const list = state.byUser[userId];
        if (!list || !orderId) return;
        state.byUser[userId] = list.filter(
          (o) => String(o._id) !== orderId
        );
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const order = action.payload;
        if (!order?._id) return;
        const id = String(order._id);
        for (const uid of Object.keys(state.byUser)) {
          const list = state.byUser[uid];
          if (!Array.isArray(list)) continue;
          const idx = list.findIndex((o) => String(o._id) === id);
          if (idx !== -1) {
            state.byUser[uid][idx] = order;
            return;
          }
        }
      })
      .addCase(logout, (state) => {
        state.byUser = {};
        state.loading = false;
        state.creating = false;
        state.error = '';
        state.createError = '';
      });
  },
});

export const selectOrders = (state) => {
  const userId = getUserId(state);
  return state.orders.byUser[userId] || [];
};
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.error;
export const selectOrderCreating = (state) => state.orders.creating;
export const selectOrderCreateError = (state) => state.orders.createError;

export default ordersSlice.reducer;
