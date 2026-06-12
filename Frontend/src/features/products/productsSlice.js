import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { productsAPI, getApiErrorMessage } from '../../api/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await productsAPI.getAll(params);
      return data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load products'));
    }
  },
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
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    categories: [],
    pagination: {
      page: 1,
      limit: 30,
      totalItems: 0,
      totalPages: 1,
    },
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
        // Accept either an array (legacy) or a paginated object { items, page, limit, totalItems }
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
          state.categories = [];
          state.pagination = {
            page: 1,
            limit: action.payload.length,
            totalItems: action.payload.length,
            totalPages: 1,
          };
        } else if (action.payload && Array.isArray(action.payload.items)) {
          state.items = action.payload.items;
          state.categories = Array.isArray(action.payload.categories)
            ? action.payload.categories
            : [];
          state.pagination = {
            page: action.payload.page,
            limit: action.payload.limit,
            totalItems: action.payload.totalItems,
            totalPages: action.payload.totalPages,
          };
        } else {
          state.items = [];
        }
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
