'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { HeadphonesIcon, Plus, ChevronRight, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ticketsApi } from '@/lib/api/tickets.api';
import { TypeBadge, StatusBadge } from '@/components/support/ticket-badge';
import { CreateTicketForm } from '@/components/support/create-ticket-form';
import { Button } from '@/components/ui/button';

export default function SupportPage() {
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', 'me'],
    queryFn: () => ticketsApi.getMyTickets(),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <HeadphonesIcon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Hỗ trợ</h1>
            <p className="text-muted-foreground mt-0.5">Liên hệ BTC khi cần giúp đỡ</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2 shrink-0">
          <Plus size={16} />
          {showCreate ? 'Hủy' : 'Tạo ticket'}
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Tạo yêu cầu hỗ trợ mới</h2>
          <CreateTicketForm />
        </div>
      )}

      {/* Ticket list */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Ticket của bạn ({data?.total ?? 0})
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : !data?.tickets.length ? (
          <div className="rounded-xl border border-border bg-card px-5 py-10 text-center text-muted-foreground">
            Bạn chưa có ticket nào.
          </div>
        ) : (
          <div className="space-y-2">
            {data.tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/support/${ticket.id}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="font-semibold group-hover:text-primary transition-colors truncate">
                    {ticket.title}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <TypeBadge type={ticket.type} />
                    <StatusBadge status={ticket.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-muted-foreground">
                  <div className="flex items-center gap-1 text-sm">
                    <MessageSquare size={14} />
                    <span>{ticket._count.messages}</span>
                  </div>
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
