'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/schemas/auth.schema';
import { authApi } from '@/lib/api/auth.api';
import { AuthCard } from '@/components/auth/auth-card';
import { FormField } from '@/components/auth/form-field';
import { PasswordInput } from '@/components/auth/password-input';
import { cn } from '@/lib/utils/cn';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const token = params.get('token') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error('Link đặt lại mật khẩu không hợp lệ');
      return;
    }
    try {
      await authApi.resetPassword(token, data.newPassword);
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Đặt lại mật khẩu thất bại';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  if (!token) {
    return (
      <AuthCard title="Link không hợp lệ">
        <p className="text-center text-sm text-muted-foreground py-4">
          Link đặt lại mật khẩu không hợp lệ.{' '}
          <a href="/forgot-password" className="text-primary hover:underline">
            Yêu cầu link mới
          </a>
        </p>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Đặt lại thành công">
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle2 size={48} className="text-primary" />
          <p className="text-center text-sm text-muted-foreground">
            Mật khẩu đã được đặt lại. Đang chuyển đến trang đăng nhập...
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Đặt lại mật khẩu"
      description="Nhập mật khẩu mới cho tài khoản của bạn"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Mật khẩu mới" error={errors.newPassword?.message}>
          <PasswordInput
            {...register('newPassword')}
            className={cn(errors.newPassword && 'border-destructive')}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground">Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số</p>
        </FormField>

        <FormField label="Xác nhận mật khẩu mới" error={errors.confirmPassword?.message}>
          <PasswordInput
            {...register('confirmPassword')}
            className={cn(errors.confirmPassword && 'border-destructive')}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Đặt lại mật khẩu
        </button>
      </form>
    </AuthCard>
  );
}
