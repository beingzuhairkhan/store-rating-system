import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Prevent multiple refresh requests at the same time
let isRefreshing = false;

let refreshSubscribers: Array<
  (token: string) => void
> = [];

const subscribeTokenRefresh = (
  callback: (token: string) => void,
) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};


api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);


api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

    // Only handle 401 responses
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't refresh the refresh endpoint itself
    if (originalRequest?.url?.includes('/auth/refresh')) {
      clearAuth();

      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // Don't retry the same request endlessly
    if (originalRequest?._retry) {
      clearAuth();

      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem('refreshToken');

    // No refresh token -> logout
    if (!refreshToken) {
      clearAuth();

      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }


    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization =
            `Bearer ${newToken}`;

          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {

      const response = await axios.post(
        `${baseURL}/auth/refresh`,
        {
          refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const {
        accessToken,
        refreshToken: newRefreshToken,
      } = response.data.data;

      if (!accessToken || !newRefreshToken) {
        throw new Error('Invalid refresh response');
      }

      // Save new tokens
      localStorage.setItem('token', accessToken);
      localStorage.setItem(
        'refreshToken',
        newRefreshToken,
      );

      // Notify waiting requests
      onRefreshed(accessToken);

      // Retry original request
      originalRequest.headers.Authorization =
        `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAuth();

      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);


export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', {
      email,
      password,
    }),

  register: (data: {
    name: string;
    email: string;
    address: string;
    password: string;
  }) =>
    api.post('/auth/register', data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) =>
    api.post('/auth/password', data),

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', {
      refreshToken,
    }),
};


export const usersApi = {
  list: (params: Record<string, unknown>) =>
    api.get('/users', { params }),

  getById: (id: string) =>
    api.get(`/users/${id}`),

  // create: (data: {
  //   name: string;
  //   email: string;
  //   address: string;
  //   password: string;
  //   role: string;
  // }) =>
  //   api.post('/admin/users', data),
};


export const adminUsersApi = {
  list: (params: Record<string, unknown>) =>
    api.get('/admin/users', { params }),

  getById: (id: string) =>
    api.get(`/admin/users/${id}`),

  create: (data: {
    name: string;
    email: string;
    address: string;
    password: string;
    role: string;
  }) =>
    api.post('/admin/users', data),
};

export const adminStoresApi = {
  list: (params: Record<string, unknown>) =>
    api.get('/admin/stores', { params }),

  getById: (id: string) =>
    api.get(`/admin/stores/${id}`),

  create: (data: {
    name: string;
    email: string;
    address: string;
    ownerId: string;
  }) =>
    api.post('/admin/stores', data),
};



export const storesApi = {
  list: (params: Record<string, unknown>) =>
    api.get('/stores', { params }),

  // getById: (id: string) =>
  //   api.get(`/stores/${id}`),

  // create: (data: {
  //   name: string;
  //   email: string;
  //   address: string;
  //   ownerId: string;
  // }) =>
  //   api.post('/stores', data),
};


export const ratingsApi = {
  submit: (storeId: string, rating: number) =>
    api.post('/ratings', {
      storeId,
      rating,
    }),

  update: (storeId: string, rating: number) =>
    api.put(`/ratings/${storeId}`, {
      rating,
    }),
};


export const adminApi = {
  stats: () => api.get('/admin/stats'),
};


export const ownerApi = {
  dashboard: (params?: {
    search?: string;
    name?: string;
    email?: string;
    address?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) =>
    api.get('/store-owner/store', {
      params,
    }),

  getById: (id: string) =>
    api.get(`/store-owner/store/${id}`),  
};


export function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      const msg = error.response.data.message;

      return Array.isArray(msg)
        ? msg.join(', ')
        : String(msg);
    }

    if (error.response?.data?.error) {
      return String(error.response.data.error);
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }

    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    return `Request failed with status ${error.response?.status}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}


export function getFieldErrors(
  error: unknown,
): Record<string, string> {
  if (
    error instanceof AxiosError &&
    error.response?.data?.message
  ) {
    const msg = error.response.data.message;

    if (Array.isArray(msg)) {
      const fieldErrors: Record<string, string> = {};

      msg.forEach((m) => {
        if (
          typeof m === 'string' &&
          m.includes(' ')
        ) {
          const [field, ...rest] = m.split(' ');

          fieldErrors[field.toLowerCase()] =
            rest.join(' ');
        }
      });

      return fieldErrors;
    }
  }

  return {};
}

export default api;
