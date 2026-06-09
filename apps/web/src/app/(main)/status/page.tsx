'use client';

import { useQuery } from '@tanstack/react-query';
import { Wifi, WifiOff, Users, Cpu, Clock, Zap, RefreshCw } from 'lucide-react';
import { serverStatusApi } from '@/lib/api/server-status.api';
import { cn } from '@/lib/utils/cn';
import type { Metadata } from 'next';

function StatusBadge({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold',
        online
          ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30'
          : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30',
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', online ? 'bg-green-400 animate-pulse' : 'bg-red-400')} />
      {online ? 'Online' : 'Offline'}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'primary',
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-400',
    blue: 'bg-blue-500/10 text-blue-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    purple: 'bg-purple-500/10 text-purple-400',
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('p-2 rounded-lg', colorMap[color] ?? colorMap.primary)}>
          <Icon size={18} />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function TpsBar({ tps }: { tps: number }) {
  const pct = Math.min((tps / 20) * 100, 100);
  const color = tps >= 19 ? 'bg-green-400' : tps >= 15 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>TPS</span>
        <span>{tps.toFixed(1)} / 20</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function StatusPage() {
  const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['server-status'],
    queryFn: serverStatusApi.getStatus,
    refetchInterval: 30_000,
  });

  const { data: history } = useQuery({
    queryKey: ['server-status', 'history'],
    queryFn: serverStatusApi.getHistory,
    refetchInterval: 60_000,
  });

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('vi-VN') : '--:--';

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Trạng thái Server</h1>
          <p className="text-muted-foreground mt-1">Thông tin realtime về server Minecraft</p>
        </div>
        <div className="flex items-center gap-3">
          {data && <StatusBadge online={data.online} />}
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
          >
            <RefreshCw size={12} />
            Làm mới
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : data?.online ? (
        <>
          {/* Stat grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Người chơi"
              value={data.players.online}
              sub={`/ ${data.players.max} tối đa`}
              color="green"
            />
            <StatCard
              icon={Zap}
              label="TPS"
              value={data.tps.toFixed(1)}
              sub="Tối đa 20"
              color={data.tps >= 19 ? 'green' : data.tps >= 15 ? 'yellow' : 'primary'}
            />
            <StatCard
              icon={Cpu}
              label="Phiên bản"
              value={data.version}
              color="blue"
            />
            <StatCard
              icon={Wifi}
              label="Ping"
              value={`${data.ping}ms`}
              sub="Từ server check"
              color="purple"
            />
          </div>

          {/* Server info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Connection */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold mb-4">Kết nối</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">IP Server</span>
                  <button
                    onClick={() => navigator.clipboard?.writeText('play.dogeland.vn')}
                    className="font-mono text-primary hover:underline"
                  >
                    play.dogeland.vn
                  </button>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Port</span>
                  <span className="font-mono">25565</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Phiên bản</span>
                  <span className="font-mono">{data.version}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <TpsBar tps={data.tps} />
                </div>
              </div>
            </div>

            {/* Online players */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold mb-4">
                Người chơi online{' '}
                <span className="text-muted-foreground font-normal text-sm">({data.players.online})</span>
              </h2>
              {data.players.sample.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.players.sample.map((p) => (
                    <span
                      key={p.uuid}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://mc-heads.net/avatar/${p.uuid}/16`}
                        alt={p.name}
                        width={16}
                        height={16}
                        className="rounded"
                      />
                      {p.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {data.players.online > 0
                    ? 'Danh sách người chơi được ẩn'
                    : 'Chưa có người chơi nào online'}
                </p>
              )}
            </div>
          </div>

          {/* Player count history sparkline */}
          {history && history.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold mb-4">Lịch sử người chơi (1 giờ)</h2>
              <PlayerSparkline data={history} />
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <WifiOff size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Server đang offline</h2>
          <p className="text-muted-foreground mt-2">
            Server có thể đang trong quá trình bảo trì. Vui lòng thử lại sau.
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Cập nhật lần cuối: {lastUpdated} · Tự động làm mới mỗi 30 giây
      </p>
    </main>
  );
}

function PlayerSparkline({ data }: { data: { time: string; players: number }[] }) {
  const maxPlayers = Math.max(...data.map((d) => d.players), 1);
  const width = 100;
  const height = 60;
  const padX = 4;
  const padY = 4;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (width - padX * 2);
    const y = padY + (1 - d.players / maxPlayers) * (height - padY * 2);
    return `${x},${y}`;
  });

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-20"
        preserveAspectRatio="none"
      >
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Fill */}
        <polygon
          points={`${padX},${height - padY} ${points.join(' ')} ${width - padX},${height - padY}`}
          fill="hsl(var(--primary))"
          fillOpacity={0.1}
        />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{new Date(data[0].time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="font-medium text-foreground">
          Peak: {maxPlayers} người
        </span>
        <span>{new Date(data[data.length - 1].time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}
