'use client';

import { cn } from '@/lib/utils/cn';
import type { GameMode, Period } from '@/lib/api/leaderboard.api';

const GAME_MODE_LABELS: Record<GameMode, string> = {
  global: 'Tổng hợp',
  survival: 'Survival',
  skyblock: 'Skyblock',
  bedwars: 'Bed Wars',
  minigames: 'Minigames',
};

const PERIOD_LABELS: Record<Period, string> = {
  weekly: 'Tuần này',
  monthly: 'Tháng này',
  alltime: 'Mọi thời đại',
};

interface LeaderboardFiltersProps {
  gameMode: GameMode;
  period: Period;
  onGameModeChange: (gm: GameMode) => void;
  onPeriodChange: (p: Period) => void;
}

export function LeaderboardFilters({ gameMode, period, onGameModeChange, onPeriodChange }: LeaderboardFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Game mode tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(GAME_MODE_LABELS) as GameMode[]).map((gm) => (
          <button
            key={gm}
            onClick={() => onGameModeChange(gm)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-all',
              gameMode === gm
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {GAME_MODE_LABELS[gm]}
          </button>
        ))}
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
              period === p
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>
    </div>
  );
}
