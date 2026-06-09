'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, Ban, ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, type AdminUser } from '@/lib/api/admin.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-500/15 text-red-400 border-red-500/30',
  MODERATOR: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  PLAYER: 'bg-muted text-muted-foreground border-border',
};
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-400 border-green-500/30',
  BANNED: 'bg-red-500/15 text-red-400 border-red-500/30',
  MUTED: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

function UserRow({ user, onBan, onRole, onBalance, isMutating }: {
  user: AdminUser;
  onBan: (u: AdminUser) => void;
  onRole: (u: AdminUser) => void;
  onBalance: (u: AdminUser) => void;
  isMutating: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
      <img
        src={`https://mc-heads.net/avatar/${user.username}/32`}
        alt={user.username}
        width={32}
        height={32}
        className="rounded-md shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{user.username}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn('text-xs font-semibold border rounded-full px-2 py-0.5', ROLE_COLORS[user.role])}>
          {user.role}
        </span>
        <span className={cn('text-xs font-semibold border rounded-full px-2 py-0.5', STATUS_COLORS[user.status])}>
          {user.status}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums w-20 text-right">
          {user.balance.toLocaleString('vi-VN')} DC
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onBalance(user)}
          disabled={isMutating}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Điều chỉnh số dư"
        >
          <Coins size={14} />
        </button>
        <button
          onClick={() => onRole(user)}
          disabled={isMutating || user.role === 'ADMIN'}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-40"
          title="Đổi role"
        >
          <Shield size={14} />
        </button>
        <button
          onClick={() => onBan(user)}
          disabled={isMutating || user.role === 'ADMIN'}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
          title={user.status === 'BANNED' ? 'Bỏ ban' : 'Ban'}
        >
          <Ban size={14} />
        </button>
      </div>
    </div>
  );
}

type ModalState =
  | { type: 'ban'; user: AdminUser }
  | { type: 'role'; user: AdminUser }
  | { type: 'balance'; user: AdminUser }
  | null;

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [banReason, setBanReason] = useState('');
  const [newRole, setNewRole] = useState('PLAYER');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, page],
    queryFn: () => adminApi.getUsers({ search: search || undefined, page }),
    placeholderData: (prev) => prev,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'users'] });

  const banMutation = useMutation({
    mutationFn: ({ id, ban, reason }: { id: string; ban: boolean; reason?: string }) =>
      adminApi.banUser(id, ban, reason),
    onSuccess: (u) => {
      toast.success(u.status === 'BANNED' ? `Đã ban ${u.username}` : `Đã bỏ ban ${u.username}`);
      setModal(null);
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Thất bại'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.changeRole(id, role),
    onSuccess: (u) => {
      toast.success(`Đã đổi role ${u.username} → ${u.role}`);
      setModal(null);
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Thất bại'),
  });

  const balanceMutation = useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      adminApi.adjustBalance(id, amount, reason),
    onSuccess: () => {
      toast.success('Đã cập nhật số dư');
      setModal(null);
      setBalanceAmount('');
      setBalanceReason('');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Thất bại'),
  });

  const isMutating = banMutation.isPending || roleMutation.isPending || balanceMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Người dùng</h2>
        <span className="text-sm text-muted-foreground">{data?.total ?? 0} người dùng</span>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Tìm theo username hoặc email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span className="w-8 shrink-0" />
          <span className="flex-1">Người dùng</span>
          <span className="w-52 text-right shrink-0">Role / Status / Balance</span>
          <span className="w-20 shrink-0" />
        </div>

        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-8 w-8 rounded-md bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-48 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data?.users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onBan={(u) => { setBanReason(''); setModal({ type: 'ban', user: u }); }}
                onRole={(u) => { setNewRole(u.role); setModal({ type: 'role', user: u }); }}
                onBalance={(u) => { setBalanceAmount(''); setBalanceReason(''); setModal({ type: 'balance', user: u }); }}
                isMutating={isMutating}
              />
            ))}
            {!data?.users.length && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Không có người dùng nào
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {data.page} / {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
              <ChevronLeft size={14} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Ban modal */}
      {modal?.type === 'ban' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">
              {modal.user.status === 'BANNED' ? `Bỏ ban ${modal.user.username}` : `Ban ${modal.user.username}`}
            </h3>
            {modal.user.status !== 'BANNED' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Lý do (tùy chọn)</label>
                <Input
                  placeholder="Vi phạm nội quy..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setModal(null)}>Hủy</Button>
              <Button
                variant={modal.user.status === 'BANNED' ? 'default' : 'destructive'}
                onClick={() => banMutation.mutate({ id: modal.user.id, ban: modal.user.status !== 'BANNED', reason: banReason || undefined })}
                disabled={banMutation.isPending}
              >
                {modal.user.status === 'BANNED' ? 'Bỏ ban' : 'Ban người dùng'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role modal */}
      {modal?.type === 'role' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Đổi role — {modal.user.username}</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['PLAYER', 'MODERATOR', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setNewRole(r)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                    newRole === r ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setModal(null)}>Hủy</Button>
              <Button
                onClick={() => roleMutation.mutate({ id: modal.user.id, role: newRole })}
                disabled={roleMutation.isPending || newRole === modal.user.role}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Balance modal */}
      {modal?.type === 'balance' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Điều chỉnh số dư — {modal.user.username}</h3>
            <p className="text-sm text-muted-foreground">Số dư hiện tại: <strong>{modal.user.balance.toLocaleString('vi-VN')} DC</strong></p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Số lượng (âm để trừ)</label>
                <Input
                  type="number"
                  placeholder="100 hoặc -50"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Lý do</label>
                <Input
                  placeholder="Lý do điều chỉnh..."
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setModal(null)}>Hủy</Button>
              <Button
                onClick={() => balanceMutation.mutate({ id: modal.user.id, amount: Number(balanceAmount), reason: balanceReason })}
                disabled={balanceMutation.isPending || !balanceAmount || !balanceReason}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
