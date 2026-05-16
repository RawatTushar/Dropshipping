import axios from 'axios'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

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
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Auth is handled via httpOnly cookie (preferred) or legacy Bearer token.

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
  confirmEmail: (token) => api.get(`/auth/confirm-email/${token}`),
  sendOTP: (body) => api.post('/auth/login-otp/send', body),
  verifyOTP: (body) => api.post('/auth/login-otp/verify', body),
  logout: () => api.post('/auth/logout'),
  sendMagicLink: (email) => api.post('/auth/magic-link/send', { email }),
  verifyMagicLink: (email, token) => api.post('/auth/magic-link/verify', { email, token }),
}

// Products API calls
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  /** Personalized + rule-based; pass `viewedIds` from local browse history for guests. */
  getRecommendations: (id, { limit = 8, viewedIds = [] } = {}) => {
    const params = { limit }
    if (viewedIds?.length) {
      params.viewed = viewedIds.slice(0, 16).join(',')
    }
    return api.get(`/products/${id}/recommendations`, { params })
  },
  /** Fire-and-forget: persists for logged-in users (view / cart_add). */
  trackInteraction: (productId, type) =>
    api.post(`/products/${productId}/interaction`, { type }).catch(() => undefined),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`)
}

// Orders API calls
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  update: (id, body) => api.put(`/orders/${id}`, body),
  cancel: (id) => api.delete(`/orders/${id}`),
}

// Stripe / payments (card checkout uses hosted Stripe Checkout)
export const paymentsAPI = {
  getConfig: () => api.get('/payments/config'),
  createCheckoutSession: (payload) =>
    api.post('/payments/create-checkout-session', payload),
  completeStripeCheckout: (sessionId) =>
    api.post('/payments/stripe/complete', { sessionId }),
}

// Export default api instance for custom calls
export default api