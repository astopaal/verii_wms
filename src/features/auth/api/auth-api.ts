import { api } from '@/lib/axios';
import type { LoginRequest, LoginResponse } from '../types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email: data.email,
      password: data.password,
    });
    return response;
  },
  register: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/register', {
      email: data.email,
      password: data.password,
    });
    return response;
  },
};