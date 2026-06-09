'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Send, Lock, LockOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { ticketsApi } from '@/lib/api/tickets.api';
import { useUser } from '@/lib/stores/auth.store';
import { TypeBadge, StatusBadge } from '@/components/support/ticket-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useUser();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');

  const { data: ticket } = useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketsApi.getTicket(id),
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['tickets', id, 'messages'],
    queryFn: () => ticketsApi.getMessages(id),
    enabled: !!ticket,
    refetchInterval: 10000, // poll every 10s
  });

  const sendMutation = useMutation({
    mutationFn: () => ticketsApi.sendMessage(id, reply),
    onSuccess: () => {
      setReply('');
      queryClient.invalidateQueries({ queryKey: ['tickets', id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', id] });
    },
    onError: () => toast.error('Gửi thất bại'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: 'OPEN' | 'CLOSED') => ticketsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', id] });
      toast.success(ticket?.status === 'OPEN' ? 'Ticket đã đóng' : 'Ticket đã mở lại');
    },
  });

  const isStaff = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');
  const isOwner = user && ticket?.userId === user.id;
  const canClose = isOwner || isStaff;
  const canReply = ticket?.status === 'OPEN' || isStaff;

  if (!ticket && !isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        Ticket không tồn tại hoặc bạn không có quyền xem.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      {/* Back */}
      <Link
        href="/support"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft size={14} /> Danh sách ticket
      </Link>

      {/* Ticket header */}
      {ticket && (
        <div className="rounded-2xl border border-border bg-card px-6 py-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold leading-snug flex-1">{ticket.title}</h1>
            {canClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => statusMutation.mutate(ticket.status === 'OPEN' ? 'CLOSED' : 'OPEN')}
                disabled={statusMutation.isPending}
                className="shrink-0 gap-1.5"
              >
                {ticket.status === 'OPEN' ? <Lock size={13} /> : <LockOpen size={13} />}
                {ticket.status === 'OPEN' ? 'Đóng ticket' : 'Mở lại'}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={ticket.type} />
            <StatusBadge status={ticket.status} />
            <span className="text-xs text-muted-foreground">
              #{ticket.id} · {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: vi })}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="rounded-2xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages?.map((msg) => {
              const isMe = msg.authorId === user?.id;
              const isStaffMsg = msg.author.role === 'ADMIN' || msg.author.role === 'MODERATOR';

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-4 px-6 py-5',
                    isStaffMsg && 'bg-primary/5',
                  )}
                >
                  <Image
                    src={`https://mc-heads.net/avatar/${msg.author.username}/40`}
                    alt={msg.author.username}
                    width={40}
                    height={40}
                    unoptimized
                    className="rounded-lg shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/player/${msg.author.username}`}
                        className="font-semibold text-sm hover:text-primary transition-colors"
                      >
                        {msg.author.username}
                      </Link>
                      {isStaffMsg && (
                        <span className="text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 rounded-full px-1.5 py-0.5">
                          BTC
                        </span>
                      )}
                      {isMe && !isStaffMsg && (
                        <span className="text-[10px] text-muted-foreground">Bạn</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: vi })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply box */}
      {canReply ? (
        <div className="space-y-2">
          <textarea
            className="w-full min-h-[100px] rounded-xl border border-border bg-background px-4 py-3 text-sm resize-y
              placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Nhập tin nhắn..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={5000}
          />
          <div className="flex justify-end">
            <Button
              onClick={() => sendMutation.mutate()}
              disabled={!reply.trim() || sendMutation.isPending}
              className="gap-2"
            >
              <Send size={14} />
              {sendMutation.isPending ? 'Đang gửi...' : 'Gửi'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 text-center text-sm text-muted-foreground">
          Ticket đã đóng — không thể trả lời
        </div>
      )}
    </div>
  );
}
