'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { economyApi } from '@/lib/api/economy.api';
import { useUser } from '@/lib/stores/auth.store';
import { TransactionList } from '@/components/player/transaction-list';
import { Button } from '@/components/ui/button';

export default function TransactionsPage() {
  const user = useUser();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['economy', 'transactions', page],
    queryFn: () => economyApi.getTransactions(page),
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-black">Lịch sử giao dịch</h1>
        {data && (
          <p className="mt-1 text-sm text-muted-foreground">
            {data.total.toLocaleString('vi-VN')} giao dịch
          </p>
        )}
      </div>

      <TransactionList items={data?.items ?? []} loading={isLoading} />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
