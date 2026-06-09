'use client';

import { ArrowDownLeft, ArrowUpRight, Gift, ShoppingCart, Trophy, Coins } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Transaction } from '@/lib/api/economy.api';

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  DEPOSIT: { label: 'Nạp tiền', icon: <ArrowDownLeft size={14} />, color: 'text-green-400' },
  WITHDRAW: { label: 'Rút tiền', icon: <ArrowUpRight size={14} />, color: 'text-red-400' },
  PURCHASE: { label: 'Mua hàng', icon: <ShoppingCart size={14} />, color: 'text-red-400' },
  GIFT_CODE: { label: 'Mã quà tặng', icon: <Gift size={14} />, color: 'text-purple-400' },
  REWARD: { label: 'Phần thưởng', icon: <Trophy size={14} />, color: 'text-yellow-400' },
  ADMIN_ADJUST: { label: 'Điều chỉnh', icon: <Coins size={14} />, color: 'text-blue-400' },
  REFUND: { label: 'Hoàn tiền', icon: <ArrowDownLeft size={14} />, color: 'text-green-400' },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

interface TransactionListProps {
  items: Transaction[];
  loading?: boolean;
}

export function TransactionList({ items, loading }: TransactionListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        Chưa có giao dịch nào
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((tx) => {
        const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.ADMIN_ADJUST;
        const isPositive = tx.amount > 0;

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/60 px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted', cfg.color)}>
                {cfg.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{cfg.label}</p>
                <p className="text-xs text-muted-foreground truncate">{tx.reason}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={cn('text-sm font-bold tabular-nums', isPositive ? 'text-green-400' : 'text-red-400')}>
                {isPositive ? '+' : ''}{tx.amount.toLocaleString('vi-VN')} DC
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
