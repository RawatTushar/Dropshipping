import axios from 'axios'

const API_BASE_URL = 'http://localhost:4000/api'

/** Readable message for failed axios calls (network vs API JSON body). */
export function getApiErrorMessage(err, fallback = 'Something went wrong.') {
  const data = err.response?.data
  if (data && typeof data.message === 'string') return data.message
  if (typeof data === 'string' && data.length < 500) return data
  const code = err.code
  const msg = err.message || ''
  if (
    msg === 'Network Error' ||
    code === 'ERR_NETWORK' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT'
  ) {
    return `Cannot reach the server at ${API_BASE_URL}. Start the backend and ensure its port matches (see backend .env PORT).`
  }
  return msg || fallback
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
  confirmEmail: (token) => api.get(`/auth/confirm-email/${token}`),
  sendOTP: (body) => api.post('/auth/login-otp/send', body),
  verifyOTP: (body) => api.post('/auth/login-otp/verify', body),
}

// Products API calls
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`)
}

// Orders API calls
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData)
}

// Export default api instance for custom calls
export default api