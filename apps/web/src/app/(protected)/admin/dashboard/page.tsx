'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, HeadphonesIcon, ArrowUpRight, UserPlus, Activity } from 'lucide-react';
import { adminApi } from '@/lib/api/admin.api';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`rounded-lg p-2 ${accent ?? 'bg-primary/10'}`}>
          <Icon size={16} className={accent ? 'text-white' : 'text-primary'} />
        </div>
      </div>
      <p className="text-3xl font-black tabular-nums">
        {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Tổng quan</h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Tổng người dùng"
          value={stats?.totalUsers ?? 0}
          sub={`${stats?.activeUsers ?? 0} đang hoạt động`}
          icon={Users}
        />
        <StatCard
          label="Người dùng mới"
          value={stats?.newUsersThisWeek ?? 0}
          sub="7 ngày qua"
          icon={UserPlus}
          accent="bg-green-500/20"
        />
        <StatCard
          label="Ticket đang mở"
          value={stats?.openTickets ?? 0}
          sub="Chờ xử lý"
          icon={HeadphonesIcon}
          accent={stats?.openTickets ? 'bg-orange-500/20' : undefined}
        />
        <StatCard
          label="Tổng giao dịch"
          value={stats?.totalTransactions ?? 0}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Truy cập nhanh</h3>
          </div>
          <div className="space-y-2">
            {[
              { href: '/admin/users', label: 'Quản lý người dùng', desc: 'Ban, đổi role, điều chỉnh số dư' },
              { href: '/admin/giftcodes', label: 'Tạo Gift Code', desc: 'Batch tạo mã quà tặng' },
              { href: '/admin/audit-logs', label: 'Audit Log', desc: 'Xem lịch sử hành động admin' },
              { href: '/support', label: 'Support Tickets', desc: 'Xem tất cả ticket người chơi' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
