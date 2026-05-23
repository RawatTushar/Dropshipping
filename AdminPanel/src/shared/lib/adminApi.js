import axios from 'axios';

/** In dev, use same origin so Vite proxies `/api` to the backend (see vite.config.js). */
/** Same origin in prod (gateway /api); Vite proxy in dev. */
const apiBase = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL ?? '');

const axiosInstance = axios.create({
  baseURL: apiBase,
});
export const login = async (email, password) => {
  const { data } = await axiosInstance.post(
    '/api/auth/login',
    { email, password },
    { headers: { 'Content-Type': 'application/json' } }
  );
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
