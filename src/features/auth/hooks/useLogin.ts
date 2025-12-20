import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { authApi } from '../api/auth-api';
import { useAuthStore } from '@/stores/auth-store';
import { getUserFromToken } from '@/utils/jwt';
import type { LoginRequest } from '../types/auth';

export const useLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const user = getUserFromToken(response.data);
        if (user) {
          setAuth(user, response.data);
          navigate('/');
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.login.loginError'));
    },
  });
};

