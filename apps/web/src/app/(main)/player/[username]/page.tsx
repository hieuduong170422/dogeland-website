import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Calendar, Clock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlayerAvatar } from '@/components/player/player-avatar';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1');

const ROLE_LABELS: Record<string, { label: string; variant: 'default' | 'warning' | 'destructive' }> = {
  PLAYER: { label: 'Player', variant: 'default' },
  MOD: { label: 'Moderator', variant: 'warning' },
  ADMIN: { label: 'Admin', variant: 'destructive' },
  SUPER_ADMIN: { label: 'Owner', variant: 'destructive' },
};

async function getPlayer(username: string) {
  try {
    const res = await fetch(`${API_URL}/players/${username}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} — Player Profile`,
    description: `Xem hồ sơ người chơi ${username} trên Dogeland`,
  };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const player = await getPlayer(username);

  if (!player) notFound();

  const roleInfo = ROLE_LABELS[player.role] ?? ROLE_LABELS.PLAYER;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Profile card */}
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <PlayerAvatar username={player.username} size={96} className="rounded-xl" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black">{player.username}</h1>
              <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
              {player.status === 'BANNED' && (
                <Badge variant="destructive">Bị cấm</Badge>
              )}
            </div>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>Tham gia: {formatDate(player.createdAt)}</span>
              </div>
              {player.lastSeen && (
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>Lần cuối online: {timeAgo(player.lastSeen)}</span>
                </div>
              )}
              {player.twoFactorEnabled && (
                <div className="flex items-center gap-2 text-green-400">
                  <Shield size={14} />
                  <span>2FA đã bật</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder stats section */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Rank toàn cầu', value: '—' },
          { label: 'Giờ chơi', value: '—' },
          { label: 'Điểm tích lũy', value: '—' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card/60 p-4 text-center">
            <p className="text-2xl font-black text-muted-foreground">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
