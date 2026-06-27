import axios from 'axios';

const DEV_API = 'http://localhost:4000';

const normalizeBase = (raw) => {
  const s = String(raw || '').trim().replace(/\/+$/, '');
  if (!s) return import.meta.env.DEV ? DEV_API : '';
  if (s.endsWith('/api')) return s.slice(0, -4);
  return s;
};

const apiBase =
  (import.meta.env.VITE_API_URL && normalizeBase(import.meta.env.VITE_API_URL)) ||
  (import.meta.env.DEV ? DEV_API : '');

export function getAdminApiErrorMessage(err, fallback = 'Request failed.') {
  const data = err.response?.data;
  if (data && typeof data.message === 'string') return data.message;
  if (typeof data === 'string' && data.length < 500) return data;
  const msg = err.message || '';
  if (msg === 'Network Error' || err.code === 'ERR_NETWORK') {
    return 'Cannot reach the API. Start the backend and ensure VITE_API_URL or the fallback port is correct.';
  }
  return msg || fallback;
}

const axiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email, password) => {
  const { data } = await axiosInstance.post('/api/auth/login', {
    email: String(email).trim().toLowerCase(),
    password,
  });
  return data;
};

export const authMe = () => axiosInstance.get('/api/auth/me');

export const authLogout = () => axiosInstance.post('/api/auth/logout');

export const getProducts = async () => axiosInstance.get('/api/products');

export const getProductById = async (id) => axiosInstance.get(`/api/products/${id}`);

export const createProduct = async (productData) => axiosInstance.post('/api/products', productData);

export const updateProduct = async (id, productData) =>
  axiosInstance.put(`/api/products/${id}`, productData);

export const deleteProduct = async (id) =>
  axiosInstance.delete(`/api/products/${id}`);

export const getAdminOrders = async () =>
  axiosInstance.get('/api/orders/admin/all');

export const getAdminInsights = async () =>
  axiosInstance.get('/api/admin/insights');

export default axiosInstance;
