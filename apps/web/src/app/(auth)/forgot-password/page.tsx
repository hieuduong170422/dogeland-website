'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas/auth.schema';
import { authApi } from '@/lib/api/auth.api';
import { AuthCard } from '@/components/auth/auth-card';
import { FormField, inputClass } from '@/components/auth/form-field';
import { cn } from '@/lib/utils/cn';

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await authApi.forgotPassword(data.login);
      setDone(true);
    } catch {
      // API always returns success — this path shouldn't happen
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  if (done) {
    return (
      <AuthCard title="Kiểm tra email" footer={{ text: 'Nhớ mật khẩu?', link: '/login', label: 'Đăng nhập' }}>
        <div className="flex flex-col items-center gap-4 py-4">
          <Mail size={48} className="text-primary" />
          <p className="text-center text-sm text-muted-foreground">
            Nếu tài khoản tồn tại, chúng tôi đã gửi email đặt lại mật khẩu. Kiểm tra hộp thư của bạn (kể cả spam).
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Quên mật khẩu"
      description="Nhập username hoặc email để đặt lại mật khẩu"
      footer={{ text: 'Nhớ mật khẩu?', link: '/login', label: 'Đăng nhập' }}
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Gửi email đặt lại
        </button>
      </form>
    </AuthCard>
  );
}
