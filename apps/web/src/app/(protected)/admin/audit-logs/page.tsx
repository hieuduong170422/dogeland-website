'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { adminApi } from '@/lib/api/admin.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

const ACTION_COLORS: Record<string, string> = {
  'user.ban': 'bg-red-500/15 text-red-400',
  'user.unban': 'bg-green-500/15 text-green-400',
  'user.role_change': 'bg-blue-500/15 text-blue-400',
  'economy.adjust': 'bg-yellow-500/15 text-yellow-400',
  'giftcode.create': 'bg-purple-500/15 text-purple-400',
  'giftcode.delete': 'bg-red-500/15 text-red-400',
};

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', page, actionFilter],
    queryFn: () => adminApi.getAuditLogs({ page, action: actionFilter || undefined }),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Audit Log</h2>
        <span className="text-sm text-muted-foreground">{data?.total ?? 0} bản ghi</span>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Lọc theo action (vd: user.ban, economy.adjust)..."
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
        />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 px-4 flex items-center gap-4">
                <div className="h-5 w-24 rounded bg-muted animate-pulse" />
                <div className="h-3 w-32 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data?.logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 px-4 py-3">
                <span className={cn(
                  'shrink-0 mt-0.5 text-xs font-mono font-bold rounded px-2 py-0.5',
                  ACTION_COLORS[log.action] ?? 'bg-muted text-muted-foreground',
                )}>
                  {log.action}
                </span>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {log.user?.username ?? 'System'}
                    </span>
                    {log.resourceType && log.resourceId && (
                      <span className="text-xs text-muted-foreground">
                        → {log.resourceType} #{log.resourceId}
                      </span>
                    )}
                  </div>
                  {log.data && (
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {JSON.stringify(log.data)}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: vi })}
                  </p>
                  {log.ipAddress && (
                    <p className="text-xs text-muted-foreground/60 font-mono">{log.ipAddress}</p>
                  )}
                </div>
              </div>
            ))}
            {!data?.logs.length && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Không có bản ghi nào
              </div>
            )}
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Trang {data.page} / {data.totalPages}</p>
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
    </div>
  );
}
