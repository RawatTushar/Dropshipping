import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { productsAPI, getApiErrorMessage } from '../../api/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await productsAPI.getAll();
      return data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load products'));
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await productsAPI.getById(id);
      return data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load product details'));
    }
  }
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
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loadingDetails = false;
        state.detailsError = action.payload || 'Unable to fetch product details';
      });
  },
});

export default productsSlice.reducer;
