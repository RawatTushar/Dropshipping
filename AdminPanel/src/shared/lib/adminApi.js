import axios from 'axios';

/** Same origin in prod (gateway /api); Vite proxy in dev. */
const apiBase = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL ?? '');

export function getAdminApiErrorMessage(err, fallback = 'Request failed.') {
  const data = err.response?.data;
  if (data && typeof data.message === 'string') return data.message;
  if (typeof data === 'string' && data.length < 500) return data;
  const msg = err.message || '';
  if (msg === 'Network Error' || err.code === 'ERR_NETWORK') {
    return 'Cannot reach the API. Check that the backend is running and /api is proxied correctly.';
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

export const getProducts = async () => {
  const { data } = await axiosInstance.get('/api/products');
  return data;
};

export const getProductById = async (id) => {
  const { data } = await axiosInstance.get(`/api/products/${id}`);
  return data;
};

export const createProduct = async (productData, config) => {
  const { data } = await axiosInstance.post('/api/products', productData, config);
  return data;
};

export const updateProduct = async (id, productData, config) => {
  const { data } = await axiosInstance.put(`/api/products/${id}`, productData, config);
  return data;
};

export const deleteProduct = async (id, config) => {
  const { data } = await axiosInstance.delete(`/api/products/${id}`, config);
  return data;
};

export const getAdminInsights = async (config) => {
  const { data } = await axiosInstance.get('/api/admin/insights', config);
  return data;
};

export default axiosInstance;
