'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/schemas/auth.schema';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { AuthCard } from '@/components/auth/auth-card';
import { FormField, inputClass } from '@/components/auth/form-field';
import { PasswordInput } from '@/components/auth/password-input';
import { cn } from '@/lib/utils/cn';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [needs2FA, setNeeds2FA] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await authApi.login(data);

      if ('requires2FA' in res) {
        setNeeds2FA(true);
        return;
      }

      setAuth(res.accessToken, { ...res.user } as any);
      toast.success(`Chào mừng, ${res.user.username}!`);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Đăng nhập thất bại';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handle2FA = async (code: string) => {
    try {
      const data = getValues();
      const res = await authApi.login({ ...data, totpCode: code });
      if ('requires2FA' in res) return;
      setAuth(res.accessToken, { ...res.user } as any);
      toast.success(`Chào mừng, ${res.user.username}!`);
      router.push('/dashboard');
    } catch {
      toast.error('Mã 2FA không đúng');
    }
  };

  if (needs2FA) {
    return <TotpStep onSubmit={handle2FA} isSubmitting={isSubmitting} />;
  }

  return (
    <AuthCard
      title="Đăng nhập"
      description="Chào mừng trở lại Dogeland"
      footer={{ text: 'Chưa có tài khoản?', link: '/register', label: 'Đăng ký ngay' }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Username hoặc Email" error={errors.login?.message}>
          <input
            {...register('login')}
            className={cn(inputClass, errors.login && 'border-destructive')}
            placeholder="player hoặc player@gmail.com"
            autoComplete="username"
          />
        </FormField>

        <FormField label="Mật khẩu" error={errors.password?.message}>
          <PasswordInput
            {...register('password')}
            className={cn(errors.password && 'border-destructive')}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </FormField>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="rounded border-border"
            />
            Nhớ đăng nhập
          </label>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Đăng nhập
        </button>
      </form>
    </AuthCard>
  );
}

function TotpStep({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (code: string) => void;
  isSubmitting: boolean;
}) {
  const [code, setCode] = useState('');

  return (
    <AuthCard title="Xác minh 2FA" description="Nhập mã từ ứng dụng authenticator của bạn">
      <div className="space-y-4">
        <FormField label="Mã xác minh (6 chữ số hoặc mã dự phòng)">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
            className={inputClass}
            placeholder="123456"
            maxLength={8}
            autoFocus
            autoComplete="one-time-code"
          />
        </FormField>
        <button
          onClick={() => onSubmit(code)}
          disabled={code.length < 6 || isSubmitting}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Xác minh
        </button>
      </div>
    </AuthCard>
  );
}
