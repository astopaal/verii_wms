import { z } from 'zod';

export const loginRequestSchema = z.object({
  username: z.string().min(1, 'Kullanıcı adı zorunludur'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  branchId: z.string().min(1, 'Şube seçimi zorunludur'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const registerRequestSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name?: string;
  };
  token: string;
}
