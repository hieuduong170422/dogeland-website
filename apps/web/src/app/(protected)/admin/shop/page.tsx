'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, Crown, Box, Sparkles, Star, Eye, EyeOff } from 'lucide-react';
import { shopApi, type ShopItem, type ShopItemType, type CreateShopItemPayload } from '@/lib/api/shop.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

const TYPE_OPTIONS: { value: ShopItemType; label: string }[] = [
  { value: 'RANK', label: 'Rank' },
  { value: 'CRATE', label: 'Crate' },
  { value: 'ITEM', label: 'Item' },
  { value: 'COSMETIC', label: 'Cosmetic' },
];

const TYPE_BADGES: Record<ShopItemType, string> = {
  RANK: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  CRATE: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  ITEM: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  COSMETIC: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
};

function ItemForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
}: {
  defaultValues?: Partial<CreateShopItemPayload>;
  onSubmit: (data: CreateShopItemPayload) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateShopItemPayload>({
    defaultValues: { isActive: true, sortOrder: 0, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-sm font-medium">Tên item *</label>
          <Input className="mt-1" placeholder="VIP Rank" {...register('name', { required: true })} />
        </div>
        <div>
          <label className="text-sm font-medium">Giá (xu) *</label>
          <Input className="mt-1" type="number" min={1} placeholder="1000" {...register('price', { required: true, valueAsNumber: true, min: 1 })} />
        </div>
        <div>
          <label className="text-sm font-medium">Loại *</label>
          <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" {...register('type', { required: true })}>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium">Mô tả</label>
          <textarea
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            placeholder="Mô tả chi tiết về item..."
            {...register('description')}
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium">URL ảnh</label>
          <Input className="mt-1" placeholder="https://example.com/image.png" {...register('imageUrl')} />
        </div>
        <div>
          <label className="text-sm font-medium">Server ID</label>
          <Input className="mt-1" placeholder="survival" {...register('serverId')} />
        </div>
        <div>
          <label className="text-sm font-medium">Thứ tự hiển thị</label>
          <Input className="mt-1" type="number" min={0} {...register('sortOrder', { valueAsNumber: true })} />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="isActive" {...register('isActive')} className="rounded border-input" />
          <label htmlFor="isActive" className="text-sm">Hiển thị trong cửa hàng</label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Huỷ</Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminShopPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<ShopItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShopItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'shop', page],
    queryFn: () => shopApi.adminGetItems(page),
  });

  const createMutation = useMutation({
    mutationFn: shopApi.adminCreateItem,
    onSuccess: () => {
      toast.success('Đã tạo item');
      qc.invalidateQueries({ queryKey: ['admin', 'shop'] });
      setShowCreate(false);
    },
    onError: () => toast.error('Tạo thất bại'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateShopItemPayload> }) =>
      shopApi.adminUpdateItem(id, data),
    onSuccess: () => {
      toast.success('Đã cập nhật item');
      qc.invalidateQueries({ queryKey: ['admin', 'shop'] });
      setEditItem(null);
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => shopApi.adminDeleteItem(id),
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ['admin', 'shop'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  const toggleActive = (item: ShopItem) => {
    updateMutation.mutate({ id: item.id, data: { isActive: !item.isActive } as any });
  };

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Quản lý Shop</h1>
          <p className="text-sm text-muted-foreground">Tổng: {data?.total ?? 0} sản phẩm</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus size={15} />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sản phẩm</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Loại</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Giá</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Đã bán</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded bg-muted animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  Chưa có sản phẩm nào
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', TYPE_BADGES[item.type])}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    {item.price.toLocaleString()} xu
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {item.soldCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(item)}
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium transition-colors',
                        item.isActive !== false
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          : 'bg-muted text-muted-foreground hover:bg-muted/70',
                      )}
                    >
                      {item.isActive !== false ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditItem(item)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Trang {data.page} / {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Trước
              </Button>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
          </DialogHeader>
          <ItemForm
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(v) => !v && setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sửa sản phẩm</DialogTitle>
          </DialogHeader>
          {editItem && (
            <ItemForm
              defaultValues={{ ...editItem, description: editItem.description ?? undefined, serverId: editItem.serverId ?? undefined, imageUrl: editItem.imageUrl ?? undefined }}
              onSubmit={(data) => updateMutation.mutate({ id: editItem.id, data })}
              isPending={updateMutation.isPending}
              onCancel={() => setEditItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn muốn xóa <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span>?
            {(deleteTarget?.soldCount ?? 0) > 0 && ' Item có lịch sử mua sẽ bị ẩn thay vì xóa.'}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
              Huỷ
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteTarget!.id)}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
