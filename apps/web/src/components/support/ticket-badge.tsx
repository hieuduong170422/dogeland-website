import { cn } from '@/lib/utils/cn';
import type { TicketType, TicketStatus } from '@/lib/api/tickets.api';

const TYPE_CONFIG: Record<TicketType, { label: string; className: string }> = {
  BUG: { label: 'Báo lỗi', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  BAN_APPEAL: { label: 'Kháng ban', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  BILLING: { label: 'Thanh toán', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  GENERAL: { label: 'Chung', className: 'bg-muted text-muted-foreground border-border' },
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string; dot: string }> = {
  OPEN: { label: 'Mở', className: 'bg-green-500/15 text-green-400 border-green-500/30', dot: 'bg-green-400' },
  CLOSED: { label: 'Đóng', className: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
};

export function TypeBadge({ type }: { type: TicketType }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span className={cn('text-xs font-semibold border rounded-full px-2.5 py-0.5', cfg.className)}>
      {cfg.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-2.5 py-0.5', cfg.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
