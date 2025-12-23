import axios from 'axios';
import i18n from './i18n';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://92.205.188.223:5000';
console.log("API_URL", API_URL);

if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL environment variable not found, using default:', API_URL);
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Language'] = i18n.language || 'tr';
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login?sessionExpired=true';
      }
    }

    const apiError = error.response?.data;
    if (apiError?.message) {
      error.message = apiError.message;
    } else if (apiError?.exceptionMessage) {
      error.message = apiError.exceptionMessage;
    }

    return Promise.reject(error);
  }
);

declare module 'axios' {
  export interface AxiosInstance {
    get<T = unknown>(url: string, config?: any): Promise<T>;
    post<T = unknown>(url: string, data?: any, config?: any): Promise<T>;
    put<T = unknown>(url: string, data?: any, config?: any): Promise<T>;
    delete<T = unknown>(url: string, config?: any): Promise<T>;
    patch<T = unknown>(url: string, data?: any, config?: any): Promise<T>;
  }
}