'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Link2, Unlink } from 'lucide-react';
import Image from 'next/image';
import { usersApi } from '@/lib/api/users.api';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProfileForm {
  avatarUrl: string;
}

export default function ProfileSettingsPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();

  // Handle Discord OAuth callback result
  useEffect(() => {
    const discord = searchParams.get('discord');
    if (discord === 'success') {
      toast.success('Đã kết nối Discord thành công!');
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
    } else if (discord === 'error') {
      const msg = searchParams.get('msg') ?? 'Kết nối Discord thất bại';
      toast.error(decodeURIComponent(msg));
    }
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersApi.getMe,
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProfileForm>({
    values: { avatarUrl: profile?.avatarUrl ?? '' },
  });

  const avatarPreview = watch('avatarUrl');

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      usersApi.updateProfile({ avatarUrl: data.avatarUrl || undefined }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      toast.success('Đã lưu hồ sơ');
      // Update auth store name/avatar if present
    },
    onError: () => toast.error('Lưu thất bại'),
  });

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>;
  }

  const displayAvatar = avatarPreview || `https://mc-heads.net/avatar/${profile?.username ?? 'Steve'}/80`;

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-4">Ảnh đại diện</h2>
        <div className="flex items-start gap-6">
          <div className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-border shrink-0">
            <Image
              src={displayAvatar}
              alt={profile?.username ?? 'avatar'}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 space-y-2">
            <label htmlFor="avatarUrl" className="text-sm font-medium">URL ảnh đại diện</label>
            <Input
              id="avatarUrl"
              placeholder="https://example.com/avatar.png"
              {...register('avatarUrl')}
            />
            <p className="text-xs text-muted-foreground">
              Để trống để dùng avatar Minecraft mặc định từ mc-heads.net
            </p>
          </div>
        </div>
      </section>

      {/* Account info */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-4">Thông tin tài khoản</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tên người dùng</label>
            <Input value={profile?.username ?? ''} readOnly className="mt-1 opacity-60 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground mt-1">Tên người dùng không thể thay đổi</p>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={profile?.email ?? ''} readOnly className="mt-1 opacity-60 cursor-not-allowed" />
          </div>
        </div>
      </section>

      {/* Discord */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-1">Kết nối Discord</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Liên kết tài khoản Discord để nhận role và thông báo trực tiếp
        </p>
        {profile?.discordId ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-sm text-green-400 font-medium">Đã kết nối</span>
              <span className="text-xs text-muted-foreground font-mono">({profile.discordId})</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() =>
                apiClient.delete('/discord/unlink').then(() => {
                  toast.success('Đã huỷ kết nối Discord');
                  qc.invalidateQueries({ queryKey: ['users', 'me'] });
                }).catch(() => toast.error('Huỷ kết nối thất bại'))
              }
            >
              <Unlink size={13} />
              Huỷ kết nối
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2]/10"
            onClick={() => {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
              window.location.href = `${apiUrl}/discord/authorize`;
            }}
          >
            <Link2 size={14} />
            Kết nối Discord
          </Button>
        )}
      </section>

      {/* Save */}
      <Button
        onClick={handleSubmit((data) => updateMutation.mutate(data))}
        disabled={updateMutation.isPending}
        className="gap-2"
      >
        <Save size={15} />
        {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </div>
  );
}
