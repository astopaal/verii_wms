import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginRequestSchema, type LoginRequest } from '../types/auth';
import { useLogin } from '../hooks/useLogin';
import { useBranches } from '../hooks/useBranches';
import { useAuthStore } from '@/stores/auth-store';
import { isTokenValid } from '@/utils/jwt';
import type React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import loginImage from '@/assets/login.jpg';
import { Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export function LoginPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { mutate: login, isPending } = useLogin(branches);
  const { token, isAuthenticated, logout } = useAuthStore();
  const [isPasswordButtonPressed, setIsPasswordButtonPressed] = useState(false);
  const passwordButtonRef = useRef<HTMLButtonElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: '',
      password: '',
      branchId: '',
    },
  });

  useEffect(() => {
    if (searchParams.get('sessionExpired') === 'true') {
      logout();
      toast.warning(t('auth.login.sessionExpired'));
      setSearchParams({}, { replace: true });
      return;
    }

    if (token && isTokenValid(token) && isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [searchParams, setSearchParams, t, token, isAuthenticated, navigate, logout]);

  const onSubmit = (data: LoginRequest): void => {
    login(data);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <div className="hidden lg:flex lg:w-1/2 h-full overflow-hidden relative">
          <img
            src={loginImage}
            alt="Login"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 h-full bg-background">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-3 text-center">
              <div className="flex justify-center">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Lock className="size-6 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight">
                  {t('auth.login.title')}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t('auth.login.subtitle')}
                </p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="size-4" />
                        {t('auth.login.branch')}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={branchesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            {field.value && branches?.find((b) => b.id === field.value) ? (
                              <>
                                <span>
                                  {branches.find((b) => b.id === field.value)?.name}
                                  {branches.find((b) => b.id === field.value)?.code && (
                                    <span className="text-muted-foreground ml-2">
                                      ({branches.find((b) => b.id === field.value)?.code})
                                    </span>
                                  )}
                                </span>
                              </>
                            ) : (
                              <SelectValue placeholder={t('auth.login.selectBranch')} />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(branches) && branches.length > 0 ? (
                            branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
                                {branch.code && (
                                  <span className="text-muted-foreground ml-2">
                                    ({branch.code})
                                  </span>
                                )}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-branch" disabled>
                              {t('auth.login.branchNotFound')}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="size-4" />
                        {t('auth.login.email')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('auth.login.emailPlaceholder')}
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="size-4" />
                        {t('auth.login.password')}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={isPasswordButtonPressed ? 'text' : 'password'}
                            placeholder={t('auth.login.passwordPlaceholder')}
                            className={field.value && field.value.length > 0 ? 'h-11 pr-10' : 'h-11'}
                            {...field}
                          />
                          {field.value && field.value.length > 0 && (
                            <button
                              ref={passwordButtonRef}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setIsPasswordButtonPressed(true);
                              }}
                              onMouseUp={(e) => {
                                e.preventDefault();
                                setIsPasswordButtonPressed(false);
                              }}
                              onMouseLeave={(e) => {
                                e.preventDefault();
                                setIsPasswordButtonPressed(false);
                              }}
                              onTouchStart={(e) => {
                                const touch = e.changedTouches[0] || e.touches[0];
                                if (touch) {
                                  touchIdRef.current = touch.identifier;
                                  setIsPasswordButtonPressed(true);
                                }
                              }}
                              onTouchEnd={(e) => {
                                const touch = e.changedTouches[0];
                                if (touch && touchIdRef.current === touch.identifier) {
                                  setIsPasswordButtonPressed(false);
                                  touchIdRef.current = null;
                                }
                              }}
                              onTouchCancel={(e) => {
                                const touch = e.changedTouches[0];
                                if (touch && touchIdRef.current === touch.identifier) {
                                  setIsPasswordButtonPressed(false);
                                  touchIdRef.current = null;
                                }
                              }}
                              onTouchMove={(e) => {
                                if (passwordButtonRef.current && touchIdRef.current !== null) {
                                  const touch = Array.from(e.touches).find(
                                    (t) => t.identifier === touchIdRef.current
                                  );
                                  if (touch) {
                                    const rect = passwordButtonRef.current.getBoundingClientRect();
                                    const isInsideButton =
                                      touch.clientX >= rect.left &&
                                      touch.clientX <= rect.right &&
                                      touch.clientY >= rect.top &&
                                      touch.clientY <= rect.bottom;
                                    
                                    if (!isInsideButton) {
                                      setIsPasswordButtonPressed(false);
                                      touchIdRef.current = null;
                                    }
                                  }
                                }
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors select-none"
                              aria-label="Şifreyi göster"
                            >
                              {isPasswordButtonPressed ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={isPending || branchesLoading}
                >
                  {isPending ? t('auth.login.loggingIn') : t('auth.login.loginButton')}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
