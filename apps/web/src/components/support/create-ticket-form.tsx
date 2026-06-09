'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ticketsApi, type TicketType } from '@/lib/api/tickets.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TICKET_TYPES: { value: TicketType; label: string; description: string }[] = [
  { value: 'BUG', label: '🐛 Báo lỗi', description: 'Lỗi game, crash, bug trong server' },
  { value: 'BAN_APPEAL', label: '⚖️ Kháng ban', description: 'Kháng cáo lệnh cấm hoặc mute' },
  { value: 'BILLING', label: '💳 Thanh toán', description: 'Vấn đề nạp tiền, hoàn tiền' },
  { value: 'GENERAL', label: '💬 Hỗ trợ chung', description: 'Các câu hỏi hoặc vấn đề khác' },
];

export function CreateTicketForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [type, setType] = useState<TicketType>('GENERAL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const mutation = useMutation({
    mutationFn: () => ticketsApi.createTicket({ title, type, content }),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', 'me'] });
      toast.success('Ticket đã được tạo, BTC sẽ phản hồi sớm nhất có thể');
      router.push(`/support/${ticket.id}`);
    },
    onError: () => toast.error('Tạo ticket thất bại'),
  });

  const canSubmit = title.trim().length >= 5 && content.trim().length >= 10;

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div>
        <p className="text-sm font-medium mb-2">Loại yêu cầu</p>
        <div className="grid grid-cols-2 gap-2">
          {TICKET_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                type === t.value
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <p className="font-semibold text-sm">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Tiêu đề</label>
        <Input
          placeholder="Tóm tắt vấn đề của bạn..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Mô tả chi tiết</label>
        <textarea
          className="w-full min-h-[140px] rounded-xl border border-border bg-background px-4 py-3 text-sm resize-y
            placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Mô tả vấn đề, bao gồm các bước tái hiện (nếu là bug), tên nhân vật, thời gian xảy ra..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
        />
        <p className="text-xs text-muted-foreground text-right">{content.length}/5000</p>
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={!canSubmit || mutation.isPending}
        className="w-full"
      >
        {mutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
      </Button>
    </div>
  );
}
