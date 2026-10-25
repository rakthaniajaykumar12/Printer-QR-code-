// API client with standard error handling and token management

export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  'https://printer-qr-backend.onrender.com'
).replace(/\/+$/, '') + '/api';

export function getAuthToken() {
  return localStorage.getItem('smart_xerox_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('smart_xerox_token', token);
  } else {
    localStorage.removeItem('smart_xerox_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();

  const headers = options.headers ? { ...options.headers } : {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (
    !(options.body instanceof FormData) &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && endpoint.startsWith('/owner')) {
    setAuthToken(null);
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  if (!response.ok) {
    let errorDetail = 'An error occurred';

    try {
      const errData = await response.json();
      errorDetail =
        errData.detail ||
        errData.message ||
        JSON.stringify(errData);
    } catch {
      errorDetail = `Server responded with error status ${response.status}`;
    }

    throw new Error(errorDetail);
  }

  const contentType = response.headers.get('content-type') || '';

  if (
    contentType.includes('application/octet-stream') ||
    contentType.includes('application/pdf') ||
    contentType.includes('image/')
  ) {
    return response.blob();
  }

  return response.json();
}

// Public API
export const api = {
  getPublicRates: () => request('/orders/current-rates'),

  submitOrder: (formData) =>
    request('/orders', {
      method: 'POST',
      body: formData,
    }),

  getOrderStatus: (orderId) =>
    request(`/orders/${orderId}/status`),

  // Owner authentication
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request('/auth/me'),

  changePassword: (data) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Password recovery
  forgotPassword: (data) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  setSecurityAnswers: (data) =>
    request('/auth/security-answers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Owner orders
  getOrders: (params = {}) => {
    const query = new URLSearchParams();

    if (params.status && params.status !== 'all') {
      query.append('status', params.status);
    }

    if (params.search) {
      query.append('search', params.search);
    }

    const queryString = query.toString()
      ? `?${query.toString()}`
      : '';

    return request(`/owner/orders${queryString}`);
  },

  updateOrderStatus: (orderId, status, notes = null) =>
    request(`/owner/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  deleteOrder: (orderId) =>
    request(`/owner/orders/${orderId}`, {
      method: 'DELETE',
    }),

  getStats: () => request('/owner/stats'),

  downloadOrderFileUrl: (orderId) =>
    `${API_BASE}/owner/orders/${orderId}/download`,

  // Shop settings
  getSettings: () => request('/owner/settings'),

  updateSettings: (settingsData) =>
    request('/owner/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    }),

  triggerCleanup: () =>
    request('/owner/cleanup-files', {
      method: 'POST',
    }),
};
