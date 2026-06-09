'use client';

import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { usersApi } from '@/lib/api/users.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function PasswordField({ label, id, register, error, ...rest }: { label: string; id: string; register: any; error?: string; [k: string]: any }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative mt-1">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          className="pr-10"
          {...register}
          {...rest}
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

export default function SecuritySettingsPage() {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PasswordForm>();

  const changePwMutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      usersApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => {
      toast.success('Đã đổi mật khẩu thành công');
      reset();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Đổi mật khẩu thất bại');
    },
  });

  const onSubmit = (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    changePwMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      {/* Change password */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-primary" />
          <h2 className="font-semibold">Đổi mật khẩu</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
          <PasswordField
            label="Mật khẩu hiện tại"
            id="currentPassword"
            register={register('currentPassword', { required: 'Bắt buộc' })}
            error={errors.currentPassword?.message}
          />
          <PasswordField
            label="Mật khẩu mới"
            id="newPassword"
            register={register('newPassword', {
              required: 'Bắt buộc',
              minLength: { value: 8, message: 'Ít nhất 8 ký tự' },
            })}
            error={errors.newPassword?.message}
          />
          <PasswordField
            label="Xác nhận mật khẩu mới"
            id="confirmPassword"
            register={register('confirmPassword', { required: 'Bắt buộc' })}
            error={errors.confirmPassword?.message}
          />
          <Button type="submit" disabled={changePwMutation.isPending}>
            {changePwMutation.isPending ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </Button>
        </form>
      </section>

      {/* Sessions info */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-2">Phiên đăng nhập</h2>
        <p className="text-sm text-muted-foreground">
          Để đăng xuất khỏi tất cả thiết bị, hãy đổi mật khẩu của bạn.
        </p>
      </section>
    </div>
  );
}
