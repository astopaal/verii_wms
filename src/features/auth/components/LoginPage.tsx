import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginRequestSchema, type LoginRequest } from '../types/auth';
import { useLogin } from '../hooks/useLogin';
import { useBranches } from '../hooks/useBranches';
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
import { Building2, Lock, User } from 'lucide-react';

export function LoginPage(): React.JSX.Element {
  const { mutate: login, isPending } = useLogin();
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      username: '',
      password: '',
      branchId: '',
    },
  });

  const onSubmit = (data: LoginRequest): void => {
    login(data);
  };

  return (
    <div className="h-screen flex">
      {/* Sol yarı - Görsel */}
      <div className="hidden lg:flex lg:w-1/2 h-full overflow-hidden relative">
        <img
          src={loginImage}
          alt="Login"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Sağ yarı - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 h-full bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="rounded-lg bg-primary/10 p-3">
                <Lock className="size-6 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">
                Sistem Girişi
              </h1>
              <p className="text-muted-foreground text-sm">
                VERII WMS
              </p>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="size-4" />
                      Şube
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={branchesLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Şube seçiniz" />
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
                            Şube bulunamadı
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="size-4" />
                      Kullanıcı Adı
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Kullanıcı adınızı giriniz"
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
                      Şifre
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-11"
                        {...field}
                      />
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
                {isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>© 2024 WMS. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
