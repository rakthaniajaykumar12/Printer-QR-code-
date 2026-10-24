// API client with standard error handling and token management

const API_BASE = '/api';

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
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if body is FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
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
      errorDetail = errData.detail || errData.message || JSON.stringify(errData);
    } catch {
      errorDetail = `Server responded with error status ${response.status}`;
    }
    throw new Error(errorDetail);
  }

  // Handle binary/file downloads
  if (response.headers.get('content-type')?.includes('application/octet-stream') ||
      response.headers.get('content-type')?.includes('application/pdf') ||
      response.headers.get('content-type')?.includes('image/')) {
    return response.blob();
  }

  return response.json();
}

// Public API
export const api = {
  // Public rates
  getPublicRates: () => request('/orders/current-rates'),

  // Submit order
  submitOrder: (formData) =>
    request('/orders', {
      method: 'POST',
      body: formData,
    }),

  // Track order
  getOrderStatus: (orderId) => request(`/orders/${orderId}/status`),

  // Owner Auth
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

  // Owner Orders
  getOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
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

  downloadOrderFileUrl: (orderId) => `${API_BASE}/owner/orders/${orderId}/download`,

  // Settings
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
