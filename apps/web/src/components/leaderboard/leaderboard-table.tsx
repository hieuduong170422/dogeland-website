'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { LeaderboardEntry } from '@/lib/api/leaderboard.api';

const STAT_LABELS: Record<string, string> = {
  playtime: 'giờ chơi',
  wins: 'chiến thắng',
  island_level: 'cấp đảo',
  kills: 'kill',
  deaths: 'lần chết',
};

function formatValue(value: number, statKey: string): string {
  if (statKey === 'playtime') {
    const h = Math.floor(value / 60);
    return `${h.toLocaleString('vi-VN')}h`;
  }
  return value.toLocaleString('vi-VN');
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400 fill-slate-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-700 fill-amber-700" />;
  return <span className="text-sm font-mono font-bold text-muted-foreground">#{rank}</span>;
}

function TopThreeCard({ entry }: { entry: LeaderboardEntry }) {
  const isFirst = entry.rank === 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative flex flex-col items-center gap-3 rounded-2xl border p-6 text-center',
        isFirst
          ? 'border-yellow-500/40 bg-yellow-500/5 shadow-lg shadow-yellow-500/10 ring-1 ring-yellow-500/20'
          : 'border-border bg-card',
      )}
    >
      {isFirst && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Crown className="h-8 w-8 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
        </div>
      )}
      <Image
        src={`https://mc-heads.net/avatar/${entry.username}/64`}
        alt={entry.username}
        width={64}
        height={64}
        unoptimized
        className={cn('rounded-lg', isFirst && 'ring-2 ring-yellow-400/50')}
      />
      <div>
        <Link
          href={`/player/${entry.username}`}
          className="font-bold hover:text-primary transition-colors"
        >
          {entry.username}
        </Link>
        <p className="text-sm text-muted-foreground mt-0.5">
          {formatValue(entry.value, entry.statKey)} {STAT_LABELS[entry.statKey] ?? entry.statKey}
        </p>
      </div>
      <div className={cn(
        'text-xs font-bold px-2 py-0.5 rounded-full',
        entry.rank === 1 && 'bg-yellow-500/20 text-yellow-400',
        entry.rank === 2 && 'bg-slate-500/20 text-slate-400',
        entry.rank === 3 && 'bg-amber-700/20 text-amber-600',
      )}>
        #{entry.rank}
      </div>
    </motion.div>
  );
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
}

export function LeaderboardTable({ entries, loading }: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Chưa có dữ liệu cho bảng xếp hạng này
      </div>
    );
  }

  const topThree = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);

  return (
    <div className="space-y-6">
      {/* Top 3 podium */}
      {topThree.length > 0 && (
        <div className={cn(
          'grid gap-4',
          topThree.length === 3 ? 'grid-cols-3' : `grid-cols-${topThree.length}`,
        )}>
          {topThree.length === 3
            ? [topThree[1], topThree[0], topThree[2]].map((e) => (
                <TopThreeCard key={e.username} entry={e} />
              ))
            : topThree.map((e) => <TopThreeCard key={e.username} entry={e} />)}
        </div>
      )}

      {/* Rest of the list */}
      <div className="overflow-hidden rounded-xl border border-border">
        <AnimatePresence mode="popLayout">
          {rest.map((entry, i) => (
            <motion.div
              key={`${entry.username}-${entry.gameMode}-${entry.rank}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50',
                i !== rest.length - 1 && 'border-b border-border',
              )}
            >
              <div className="w-8 flex justify-center">
                <RankBadge rank={entry.rank} />
              </div>

              <Image
                src={`https://mc-heads.net/avatar/${entry.username}/32`}
                alt={entry.username}
                width={32}
                height={32}
                unoptimized
                className="rounded"
              />

              <Link
                href={`/player/${entry.username}`}
                className="flex-1 font-semibold hover:text-primary transition-colors"
              >
                {entry.username}
              </Link>

              <div className="text-right">
                <span className="font-mono font-bold text-sm">
                  {formatValue(entry.value, entry.statKey)}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {STAT_LABELS[entry.statKey] ?? entry.statKey}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
