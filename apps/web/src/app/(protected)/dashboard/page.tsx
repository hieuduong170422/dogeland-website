'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Coins, Gift, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { economyApi } from '@/lib/api/economy.api';
import { useUser, useAuthStore } from '@/lib/stores/auth.store';
import { PlayerAvatar } from '@/components/player/player-avatar';
import { TransactionList } from '@/components/player/transaction-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const user = useUser();
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const queryClient = useQueryClient();
  const [giftCode, setGiftCode] = useState('');

  const { data: economy, isLoading } = useQuery({
    queryKey: ['economy', 'me'],
    queryFn: economyApi.getBalance,
    enabled: !!user,
  });

  const { data: txPage, isLoading: txLoading } = useQuery({
    queryKey: ['economy', 'transactions', 1],
    queryFn: () => economyApi.getTransactions(1),
    enabled: !!user,
  });

  const redeemMutation = useMutation({
    mutationFn: economyApi.redeemGiftCode,
    onSuccess: (data) => {
      toast.success(data.message);
      setGiftCode('');
      queryClient.invalidateQueries({ queryKey: ['economy'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Mã không hợp lệ');
    },
  });

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-black">Dashboard</h1>

      {/* Profile + Balance row */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Profile card */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <PlayerAvatar username={user.username} size={56} />
          <div>
            <p className="font-bold text-lg">{user.username}</p>
            <Badge variant={user.role === 'PLAYER' ? 'default' : 'warning'} className="mt-1">
              {user.role}
            </Badge>
          </div>
        </div>

        {/* Balance card */}
        <div className="flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Coins size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Số dư Dogecoin</p>
            {isLoading ? (
              <Skeleton className="h-7 w-32 mt-1" />
            ) : (
              <p className="text-2xl font-black tabular-nums">
                {(economy?.balance ?? 0).toLocaleString('vi-VN')} DC
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gift code redemption */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-primary" />
          <h2 className="font-semibold">Đổi mã quà tặng</h2>
        </div>
        <div className="flex gap-2">
          <input
            value={giftCode}
            onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
            placeholder="NHẬP MÃ QUÀ TẶNG"
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 font-mono text-sm uppercase placeholder:normal-case placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={64}
          />
          <Button
            onClick={() => redeemMutation.mutate(giftCode)}
            disabled={giftCode.length < 4 || redeemMutation.isPending}
          >
            {redeemMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Đổi'}
          </Button>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Giao dịch gần đây</h2>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
        <TransactionList
          items={txPage?.items?.slice(0, 5) ?? []}
          loading={txLoading}
        />
      </div>
    </div>
  );
}
