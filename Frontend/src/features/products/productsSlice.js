import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { productsAPI, getApiErrorMessage } from '../../api/api';
import { CACHE_TTL } from '../../shared/lib/httpCache';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ force = false } = {}, { rejectWithValue, getState }) => {
    try {
      const { items, lastFetchedAt } = getState().products;
      const fresh =
        !force &&
        items.length > 0 &&
        lastFetchedAt &&
        Date.now() - lastFetchedAt < CACHE_TTL.products;

      if (fresh) return items;

      const { data } = await productsAPI.getAll({ force });
      return data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load products'));
    }
  },
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async ({ id, force = false }, { rejectWithValue, getState }) => {
    try {
      const selected = getState().products.selectedProduct;
      if (
        !force &&
        selected?._id === id &&
        getState().products.lastDetailFetchedAt &&
        Date.now() - getState().products.lastDetailFetchedAt < CACHE_TTL.productDetail
      ) {
        return selected;
      }

      const { data } = await productsAPI.getById(id, { force });
      return data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load product details'));
    }
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    selectedProduct: null,
    loading: false,
    loadingDetails: false,
    error: '',
    detailsError: '',
    lastFetchedAt: null,
    lastDetailFetchedAt: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to fetch products';
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loadingDetails = true;
        state.detailsError = '';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.selectedProduct = action.payload || null;
        state.lastDetailFetchedAt = Date.now();
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loadingDetails = false;
        state.detailsError = action.payload || 'Unable to fetch product details';
      });
  },
});

export default productsSlice.reducer;
