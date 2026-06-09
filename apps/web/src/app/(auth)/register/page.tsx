'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/lib/schemas/auth.schema';
import { authApi } from '@/lib/api/auth.api';
import { AuthCard } from '@/components/auth/auth-card';
import { FormField, inputClass } from '@/components/auth/form-field';
import { PasswordInput } from '@/components/auth/password-input';
import { cn } from '@/lib/utils/cn';

export default function RegisterPage() {
  const [done, setDone] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      setRegisteredEmail(data.email);
      setDone(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Đăng ký thất bại';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  if (done) {
    return (
      <AuthCard title="Đăng ký thành công!" footer={{ text: 'Quay lại?', link: '/login', label: 'Đăng nhập ngay' }}>
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle2 size={48} className="text-primary" />
          <p className="text-center text-sm text-muted-foreground">
            Tài khoản <span className="text-foreground font-medium">{registeredEmail}</span> đã được tạo thành công.{' '}
            Bạn có thể đăng nhập ngay bây giờ.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Tạo tài khoản"
      description="Tham gia cộng đồng Dogeland"
      footer={{ text: 'Đã có tài khoản?', link: '/login', label: 'Đăng nhập' }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Username" error={errors.username?.message}>
          <input
            {...register('username')}
            className={cn(inputClass, errors.username && 'border-destructive')}
            placeholder="MinecraftPlayer"
            autoComplete="username"
          />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            className={cn(inputClass, errors.email && 'border-destructive')}
            placeholder="player@gmail.com"
            autoComplete="email"
          />
        </FormField>

        <FormField label="Mật khẩu" error={errors.password?.message}>
          <PasswordInput
            {...register('password')}
            className={cn(errors.password && 'border-destructive')}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground">Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số</p>
        </FormField>

        <FormField label="Xác nhận mật khẩu" error={errors.confirmPassword?.message}>
          <PasswordInput
            {...register('confirmPassword')}
            className={cn(errors.confirmPassword && 'border-destructive')}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </FormField>

        <p className="text-xs text-muted-foreground">
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <a href="/rules" className="text-primary hover:underline">Nội quy</a> của chúng tôi.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Đăng ký
        </button>
      </form>
    </AuthCard>
  );
}
