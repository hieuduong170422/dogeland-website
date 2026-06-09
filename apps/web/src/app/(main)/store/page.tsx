'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Package, Star, Crown, Sparkles, Box, CheckCircle2, XCircle, Coins, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { shopApi, type ShopItem, type ShopItemType } from '@/lib/api/shop.api';
import { economyApi } from '@/lib/api/economy.api';
import { useIsAuthenticated } from '@/lib/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEM_TYPES: { value: ShopItemType | 'ALL'; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { value: 'ALL', label: 'Tất cả', icon: Package },
  { value: 'RANK', label: 'Rank', icon: Crown },
  { value: 'CRATE', label: 'Crate', icon: Box },
  { value: 'ITEM', label: 'Items', icon: Sparkles },
  { value: 'COSMETIC', label: 'Cosmetic', icon: Star },
];

const TYPE_STYLES: Record<ShopItemType, { label: string; badge: string; glow: string }> = {
  RANK: { label: 'Rank', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', glow: 'hover:shadow-yellow-500/10' },
  CRATE: { label: 'Crate', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30', glow: 'hover:shadow-purple-500/10' },
  ITEM: { label: 'Item', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30', glow: 'hover:shadow-blue-500/10' },
  COSMETIC: { label: 'Cosmetic', badge: 'bg-pink-500/10 text-pink-400 border-pink-500/30', glow: 'hover:shadow-pink-500/10' },
};

const MOCK_ITEMS: ShopItem[] = [
  { id: '1', name: 'VIP Rank', description: 'Rank VIP với đặc quyền 30 ngày: /fly, /heal, 3 home, prefix [VIP]', price: 5000, type: 'RANK', serverId: null, imageUrl: null, sortOrder: 0, soldCount: 128 },
  { id: '2', name: 'MVP Rank', description: 'Rank MVP cao cấp hơn VIP: /fly, /heal, 5 home, /kit mvp mỗi ngày, prefix [MVP]', price: 10000, type: 'RANK', serverId: null, imageUrl: null, sortOrder: 1, soldCount: 64 },
  { id: '3', name: 'LEGEND Rank', description: 'Rank cao nhất: tất cả quyền MVP + /nickname, /trail, 10 home, prefix [LEGEND]', price: 20000, type: 'RANK', serverId: null, imageUrl: null, sortOrder: 2, soldCount: 32 },
  { id: '4', name: 'Mystery Crate', description: 'Hộp bí ẩn chứa item ngẫu nhiên: có thể là weapon rare, potion, hoặc xu thưởng', price: 1000, type: 'CRATE', serverId: null, imageUrl: null, sortOrder: 3, soldCount: 512 },
  { id: '5', name: 'Legendary Crate', description: 'Hộp huyền thoại với tỉ lệ ra item cực hiếm và xu thưởng cao', price: 3000, type: 'CRATE', serverId: null, imageUrl: null, sortOrder: 4, soldCount: 256 },
  { id: '6', name: 'Netherite Sword', description: 'Kiếm Netherite +Sharpness V, +Fire Aspect II, +Looting III được enchant sẵn', price: 2000, type: 'ITEM', serverId: null, imageUrl: null, sortOrder: 5, soldCount: 89 },
  { id: '7', name: 'Dragon Armor Set', description: 'Bộ giáp Dragon đầy đủ: Prot IV, Unbreaking III, Mending — set siêu bền', price: 4000, type: 'ITEM', serverId: null, imageUrl: null, sortOrder: 6, soldCount: 45 },
  { id: '8', name: 'Particle Trail', description: 'Hiệu ứng trail đẹp đi theo khi di chuyển (Wings, Hearts, Flames...)', price: 1500, type: 'COSMETIC', serverId: null, imageUrl: null, sortOrder: 7, soldCount: 200 },
  { id: '9', name: 'Custom Tag', description: 'Tag tên tùy chỉnh hiển thị trên đầu nhân vật, tối đa 10 ký tự', price: 2500, type: 'COSMETIC', serverId: null, imageUrl: null, sortOrder: 8, soldCount: 75 },
];

// ─── Item type icon mapping ───────────────────────────────────────────────────

function TypeIcon({ type, size = 16 }: { type: ShopItemType; size?: number }) {
  const icons: Record<ShopItemType, React.ComponentType<{ size?: number; className?: string }>> = {
    RANK: Crown, CRATE: Box, ITEM: Sparkles, COSMETIC: Star,
  };
  const Icon = icons[type];
  return <Icon size={size} />;
}

// ─── Item image placeholder ───────────────────────────────────────────────────

const TYPE_EMOJI: Record<ShopItemType, string> = {
  RANK: '👑', CRATE: '📦', ITEM: '⚔️', COSMETIC: '✨',
};

function ItemImage({ item, size = 'md' }: { item: ShopItem; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'h-12 w-12 text-2xl', md: 'h-20 w-20 text-4xl', lg: 'h-28 w-28 text-5xl' };
  if (item.imageUrl) {
    return (
      <div className={cn('relative rounded-xl overflow-hidden bg-muted shrink-0', sizeMap[size])}>
        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div className={cn('flex items-center justify-center rounded-xl bg-muted shrink-0', sizeMap[size])}>
      <span>{TYPE_EMOJI[item.type]}</span>
    </div>
  );
}

// ─── Purchase Dialog ──────────────────────────────────────────────────────────

function PurchaseDialog({
  item,
  open,
  onClose,
}: {
  item: ShopItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isAuth = useIsAuthenticated();
  const [serverId, setServerId] = useState('');

  const { data: balanceData } = useQuery({
    queryKey: ['economy', 'balance'],
    queryFn: economyApi.getBalance,
    enabled: isAuth && open,
  });

  const balance = balanceData?.balance ?? 0;
  const canAfford = item ? balance >= item.price : false;

  const purchaseMutation = useMutation({
    mutationFn: () => shopApi.purchase(item!.id, 1, serverId || undefined),
    onSuccess: (res) => {
      toast.success(res.message, {
        description: `Số dư còn lại: ${res.purchase.balanceAfter.toLocaleString()} xu`,
      });
      qc.invalidateQueries({ queryKey: ['economy', 'balance'] });
      qc.invalidateQueries({ queryKey: ['shop', 'purchases'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Mua thất bại');
    },
  });

  if (!item) return null;

  const style = TYPE_STYLES[item.type];
  const newBalance = balance - item.price;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận mua hàng</DialogTitle>
        </DialogHeader>

        {/* Item preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
          <ItemImage item={item} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', style.badge)}>
                {style.label}
              </span>
            </div>
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
          </div>
        </div>

        {/* Server selector for RANK */}
        {item.type === 'RANK' && (
          <div>
            <label className="text-sm font-medium mb-1 block">Chọn server</label>
            <select
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">-- Chọn server áp dụng --</option>
              <option value="survival">Survival</option>
              <option value="skyblock">Skyblock</option>
              <option value="prison">Prison</option>
            </select>
          </div>
        )}

        {/* Balance info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Số dư hiện tại</span>
            <span className="font-medium flex items-center gap-1">
              <Coins size={13} className="text-yellow-400" />
              {balance.toLocaleString()} xu
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Giá</span>
            <span className="font-semibold text-primary">
              -{item.price.toLocaleString()} xu
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="text-muted-foreground">Số dư sau</span>
            <span className={cn('font-semibold', canAfford ? 'text-green-400' : 'text-destructive')}>
              {canAfford ? newBalance.toLocaleString() : '—'} xu
            </span>
          </div>
        </div>

        {!canAfford && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            <XCircle size={15} />
            Số dư không đủ. Cần thêm {(item.price - balance).toLocaleString()} xu.
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            className="flex-1 gap-2"
            disabled={!canAfford || purchaseMutation.isPending || (item.type === 'RANK' && !serverId)}
            onClick={() => purchaseMutation.mutate()}
          >
            {purchaseMutation.isPending ? (
              <><Loader2 size={14} className="animate-spin" /> Đang xử lý...</>
            ) : (
              <><CheckCircle2 size={14} /> Xác nhận mua</>
            )}
          </Button>
        </div>

        {!isAuth && (
          <p className="text-center text-sm text-muted-foreground">
            Bạn cần <a href="/login" className="text-primary hover:underline">đăng nhập</a> để mua hàng
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function ItemCard({ item, onBuy }: { item: ShopItem; onBuy: (item: ShopItem) => void }) {
  const style = TYPE_STYLES[item.type];

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden',
        'hover:border-primary/40 hover:shadow-lg transition-all duration-200',
        style.glow,
      )}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        ) : (
          <span className="text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300">
            {TYPE_EMOJI[item.type]}
          </span>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium', style.badge)}>
            <TypeIcon type={item.type} size={10} />
            {style.label}
          </span>
        </div>

        {/* Hot badge */}
        {item.soldCount > 100 && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">HOT 🔥</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-sm leading-tight mb-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">
          {item.description ?? 'Không có mô tả'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Coins size={14} className="text-yellow-400" />
            <span className="font-bold text-base">{item.price.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">xu</span>
          </div>
          <Button
            size="sm"
            className="gap-1.5 text-xs h-8"
            onClick={() => onBuy(item)}
          >
            <ShoppingCart size={12} />
            Mua
          </Button>
        </div>

        {item.soldCount > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Đã bán: {item.soldCount.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ItemSkeleton() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-3 w-full rounded bg-muted animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-8 w-full rounded bg-muted animate-pulse mt-3" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StorePage() {
  const [activeType, setActiveType] = useState<ShopItemType | 'ALL'>('ALL');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const isAuth = useIsAuthenticated();

  const { data: balanceData } = useQuery({
    queryKey: ['economy', 'balance'],
    queryFn: economyApi.getBalance,
    enabled: isAuth,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['shop', 'items', activeType],
    queryFn: () =>
      shopApi.getItems({ type: activeType === 'ALL' ? undefined : activeType }).catch(() => ({
        items: MOCK_ITEMS.filter((i) => activeType === 'ALL' || i.type === activeType),
        total: MOCK_ITEMS.length,
        page: 1,
        totalPages: 1,
      })),
    placeholderData: {
      items: MOCK_ITEMS.filter((i) => activeType === 'ALL' || i.type === activeType),
      total: MOCK_ITEMS.length,
      page: 1,
      totalPages: 1,
    },
  });

  const items = data?.items ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <ShoppingCart size={28} className="text-primary" />
            Cửa hàng
          </h1>
          <p className="text-muted-foreground mt-1">Mua rank, item và cosmetic bằng Dogecoin</p>
        </div>

        {isAuth && balanceData && (
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
            <Coins size={15} className="text-yellow-400" />
            <span className="text-muted-foreground">Số dư:</span>
            <span className="font-bold">{balanceData.balance.toLocaleString()} xu</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {ITEM_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveType(value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              activeType === value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <Icon size={13} />
            {label}
            {value !== 'ALL' && (
              <span className="text-xs opacity-70">
                ({MOCK_ITEMS.filter((i) => i.type === value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ItemSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package size={48} className="text-muted-foreground/30 mb-4" />
          <p className="text-lg font-semibold">Không có sản phẩm</p>
          <p className="text-muted-foreground text-sm mt-1">Danh mục này chưa có sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onBuy={(i) => {
                if (!isAuth) {
                  toast.error('Bạn cần đăng nhập để mua hàng', {
                    action: { label: 'Đăng nhập', onClick: () => { window.location.href = '/login'; } },
                  });
                  return;
                }
                setSelectedItem(i);
              }}
            />
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Coins size={16} className="text-primary" />
          Cách nạp Dogecoin
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          {[
            { step: '1', text: 'Vào trang nạp tiền trong Dashboard' },
            { step: '2', text: 'Chọn phương thức: QR Banking hoặc Momo' },
            { step: '3', text: 'Dogecoin được cộng tự động sau khi xác nhận' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {s.step}
              </span>
              <span className="text-muted-foreground">{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase dialog */}
      <PurchaseDialog
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </main>
  );
}
