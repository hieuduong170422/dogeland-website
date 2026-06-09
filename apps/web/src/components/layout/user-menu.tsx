'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { User, Settings, LogOut, ShieldCheck, Coins } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser, useAuthStore } from '@/lib/stores/auth.store';
import { authApi } from '@/lib/api/auth.api';

const ROLE_LABELS: Record<string, { label: string; variant: 'default' | 'warning' | 'destructive' }> = {
  PLAYER: { label: 'Player', variant: 'default' },
  MOD: { label: 'Mod', variant: 'warning' },
  ADMIN: { label: 'Admin', variant: 'destructive' },
  SUPER_ADMIN: { label: 'Owner', variant: 'destructive' },
};

export function UserMenu() {
  const user = useUser();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  if (!user) return null;

  const roleInfo = ROLE_LABELS[user.role] ?? ROLE_LABELS.PLAYER;
  const initials = user.username.slice(0, 2).toUpperCase();
  const avatarUrl = user.avatarUrl ?? `https://mc-heads.net/avatar/${user.username}/32`;

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    clearAuth();
    toast.success('Đã đăng xuất');
    router.push('/');
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={user.username} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-sm">{user.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <Badge variant={roleInfo.variant} className="w-fit mt-0.5 text-xs">
              {roleInfo.label}
            </Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/player/${user.username}`} className="gap-2">
            <User size={14} /> Trang cá nhân
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="gap-2">
            <Coins size={14} /> Dashboard
          </Link>
        </DropdownMenuItem>

        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="gap-2">
              <ShieldCheck size={14} /> Admin Panel
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings" className="gap-2">
            <Settings size={14} /> Cài đặt
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleLogout}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut size={14} /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
