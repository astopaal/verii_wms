import { api } from '@/lib/axios';
import type { LoginRequest, LoginResponse } from '../types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // Mock API response - Backend hazır olduğunda bu kısım değiştirilecek
    // Axios interceptor'da mock response handle ediliyor ve response.data döndürüyor
    return api.post<LoginResponse>('/auth/login', data) as unknown as Promise<LoginResponse>;
  },
  register: async (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/auth/register', data) as unknown as Promise<LoginResponse>;
  },
};