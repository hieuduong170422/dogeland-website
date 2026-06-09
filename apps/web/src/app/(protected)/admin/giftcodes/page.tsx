'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { adminApi } from '@/lib/api/admin.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

export default function AdminGiftCodesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', amount: '', maxUses: '1', expiresAt: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'giftcodes', page],
    queryFn: () => adminApi.getGiftCodes(page),
    placeholderData: (prev) => prev,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'giftcodes'] });

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createGiftCode({
        code: form.code.toUpperCase(),
        amount: Number(form.amount),
        maxUses: Number(form.maxUses),
        expiresAt: form.expiresAt || undefined,
      }),
    onSuccess: (code) => {
      toast.success(`Đã tạo mã ${code.code}`);
      setShowForm(false);
      setForm({ code: '', amount: '', maxUses: '1', expiresAt: '' });
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Tạo thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteGiftCode,
    onSuccess: () => { toast.success('Đã xóa mã'); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Xóa thất bại'),
  });

  const canCreate = form.code.length >= 4 && Number(form.amount) >= 1 && Number(form.maxUses) >= 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Gift Code</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2" size="sm">
          <Plus size={14} />
          {showForm ? 'Hủy' : 'Tạo mã mới'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold">Tạo Gift Code mới</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mã code</label>
              <Input
                placeholder="DOGELAND2025"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                maxLength={64}
                className="font-mono uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Số DC thưởng</label>
              <Input
                type="number"
                placeholder="1000"
                min={1}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Số lần dùng tối đa</label>
              <Input
                type="number"
                placeholder="1"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hết hạn (tùy chọn)</label>
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => createMutation.mutate()} disabled={!canCreate || createMutation.isPending}>
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo Gift Code'}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_80px_80px_80px_40px] gap-4 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Mã code</span>
          <span className="text-right">Số DC</span>
          <span className="text-right">Đã dùng</span>
          <span className="text-right">Tối đa</span>
          <span className="text-right">Hết hạn</span>
          <span />
        </div>

        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 px-4 flex items-center">
                <div className="h-3 w-48 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data?.codes.map((code) => {
              const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date();
              const isFull = code.usedCount >= code.maxUses;
              return (
                <div key={code.id} className="grid grid-cols-[1fr_80px_80px_80px_80px_40px] gap-4 items-center px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-mono font-bold text-sm ${isExpired || isFull ? 'text-muted-foreground line-through' : 'text-primary'}`}>
                      {code.code}
                    </span>
                    <CopyButton text={code.code} />
                  </div>
                  <span className="text-right text-sm tabular-nums">{code.amount.toLocaleString('vi-VN')}</span>
                  <span className="text-right text-sm tabular-nums">{code.usedCount}</span>
                  <span className="text-right text-sm tabular-nums">{code.maxUses}</span>
                  <span className="text-right text-xs text-muted-foreground">
                    {code.expiresAt
                      ? isExpired
                        ? <span className="text-red-400">Hết hạn</span>
                        : formatDistanceToNow(new Date(code.expiresAt), { locale: vi, addSuffix: true })
                      : '—'}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(code.id)}
                    disabled={deleteMutation.isPending || code.usedCount > 0}
                    className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
                    title={code.usedCount > 0 ? 'Không thể xóa mã đã được sử dụng' : 'Xóa mã'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
            {!data?.codes.length && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">Chưa có gift code nào</div>
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
