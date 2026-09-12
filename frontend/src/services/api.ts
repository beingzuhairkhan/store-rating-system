import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; address: string; password: string }) =>
    api.post('/auth/register', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/password', data),
  logout: () => api.post('/auth/logout'),
};

// ---- Users ----
export const usersApi = {
  list: (params: Record<string, unknown>) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: { name: string; email: string; address: string; password: string; role: string }) =>
    api.post('/admin/users', data),
};

export const adminUsersApi = {
  list: (params: Record<string, unknown>) => api.get('/admin/users', { params }),
  getById: (id: string) => api.get(`/admin/users/${id}`),
  create: (data: { name: string; email: string; address: string; password: string; role: string }) =>
    api.post('/admin/users', data),
};

// ---- Stores ----
export const storesApi = {
  list: (params: Record<string, unknown>) => api.get('/stores', { params }),
  getById: (id: string) => api.get(`/stores/${id}`),
  create: (data: { name: string; email: string; address: string; ownerId: string }) =>
    api.post('/stores', data),
};

// ---- Ratings ----
export const ratingsApi = {
  submit: (storeId: string, rating: number) =>
    api.post('/ratings', { storeId, rating }),
  update: (storeId: string, rating: number) =>
    api.put(`/ratings/${storeId}`, { rating }),
};

// ---- Admin ----
export const adminApi = {
  stats: () => api.get('/admin/stats'),
};

// ---- Store Owner ----
export const ownerApi = {
  dashboard: () => api.get('/store-owner/store'),
};

// ---- Helper to extract error message ----
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      const msg = error.response.data.message;
      return Array.isArray(msg) ? msg.join(', ') : String(msg);
    }
    if (error.response?.data?.error) return String(error.response.data.error);
    if (error.code === 'ERR_NETWORK') return 'Network error. Please check your connection.';
    if (error.response?.status === 403) return 'You do not have permission to perform this action.';
    return `Request failed with status ${error.response?.status}`;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

// ---- Helper to extract validation errors ----
export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof AxiosError && error.response?.data?.message) {
    const msg = error.response.data.message;
    if (Array.isArray(msg)) {
      const fieldErrors: Record<string, string> = {};
      msg.forEach((m) => {
        if (typeof m === 'string' && m.includes(' ')) {
          const [field, ...rest] = m.split(' ');
          fieldErrors[field.toLowerCase()] = rest.join(' ');
        }
      });
      return fieldErrors;
    }
  }
  return {};
}
