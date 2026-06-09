'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { leaderboardApi, type GameMode, type Period } from '@/lib/api/leaderboard.api';
import { LeaderboardFilters } from '@/components/leaderboard/leaderboard-filters';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { LeaderboardPagination } from '@/components/leaderboard/leaderboard-pagination';

export default function LeaderboardPage() {
  const [gameMode, setGameMode] = useState<GameMode>('global');
  const [period, setPeriod] = useState<Period>('alltime');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', gameMode, period, page],
    queryFn: () => leaderboardApi.getLeaderboard(gameMode, period, page),
    staleTime: 60_000,
  });

  function handleGameModeChange(gm: GameMode) {
    setGameMode(gm);
    setPage(1);
  }

  function handlePeriodChange(p: Period) {
    setPeriod(p);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <Trophy className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Bảng xếp hạng</h1>
          <p className="text-muted-foreground mt-0.5">
            Top người chơi xuất sắc nhất Dogeland
          </p>
        </div>
      </div>

      {/* Filters */}
      <LeaderboardFilters
        gameMode={gameMode}
        period={period}
        onGameModeChange={handleGameModeChange}
        onPeriodChange={handlePeriodChange}
      />

      {/* Table */}
      <LeaderboardTable entries={data?.entries ?? []} loading={isLoading} />

      {/* Pagination */}
      {data && (
        <LeaderboardPagination
          page={page}
          totalPages={data.totalPages}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
