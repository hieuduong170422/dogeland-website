'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { notificationsApi, type Notification } from '@/lib/api/notifications.api';
import { useIsAuthenticated } from '@/lib/stores/auth.store';
import { cn } from '@/lib/utils/cn';

const TYPE_ICON: Record<string, string> = {
  SYSTEM: '🔔',
  PAYMENT: '💳',
  PURCHASE: '🛍️',
  FORUM_REPLY: '💬',
  MENTION: '@',
  ACHIEVEMENT: '🏆',
};

function NotifItem({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer',
        !notif.isRead && 'bg-primary/5',
      )}
      onClick={() => !notif.isRead && onRead(notif.id)}
    >
      <span className="text-lg shrink-0 mt-0.5">{TYPE_ICON[notif.type] ?? '🔔'}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-snug', !notif.isRead && 'font-semibold')}>{notif.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi })}
        </p>
      </div>
      {!notif.isRead && (
        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </div>
  );
}

export function NotificationBell() {
  const isAuth = useIsAuthenticated();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: notificationsApi.getUnreadCount,
    enabled: isAuth,
    refetchInterval: 60_000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(1),
    enabled: isAuth && open,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications', 'count'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications', 'count'] });
    },
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isAuth) return null;

  const unread = countData?.count ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Thông báo"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card shadow-lg overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-sm">Thông báo</h3>
            {unread > 0 && (
              <button
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Check size={11} />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="space-y-px">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3">
                    <div className="h-5 w-5 rounded bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                      <div className="h-2.5 w-full rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data?.items.length ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Không có thông báo nào
              </div>
            ) : (
              data.items.map((notif) => (
                <NotifItem
                  key={notif.id}
                  notif={notif}
                  onRead={(id) => markReadMutation.mutate(id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
