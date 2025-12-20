import axios, { type InternalAxiosRequestConfig } from 'axios';
import i18n from './i18n';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL environment variable not found, using default:', API_URL);
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const currentLanguage = i18n.language || 'tr';
  config.headers['X-Language'] = currentLanguage;
  
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('access_token');
      const isLoginPage = window.location.pathname === '/auth/login';
      if (token && !isLoginPage) {
        localStorage.removeItem('access_token');
        window.location.href = '/auth/login';
      }
    }
    
    if (error.response?.data) {
      const apiError = error.response.data;
      if (apiError.message) {
        error.message = apiError.message;
      } else if (apiError.exceptionMessage) {
        error.message = apiError.exceptionMessage;
      }
    }
    
    return Promise.reject(error);
  }
);