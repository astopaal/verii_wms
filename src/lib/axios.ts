import axios, { type InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.url?.includes('/auth/login')) {
    const requestData = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};
    return Promise.reject({
      config,
      response: {
        data: {
          user: {
            id: 1,
            email: requestData.username || 'test@example.com',
            name: 'Test Kullanıcı',
          },
          token: 'mock-jwt-token-' + Date.now(),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
      },
      isAxiosError: true,
    });
  }

  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.config?.url?.includes('/auth/login') && error.response?.data) {
      return Promise.resolve(error.response.data);
    }

    if (error.response?.status === 401) {
      const token = localStorage.getItem('access_token');
      if (token) {
        localStorage.removeItem('access_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);