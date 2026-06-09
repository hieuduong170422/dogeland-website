import type { Metadata } from 'next';
import { ExternalLink, Gift, Star, Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vote | Dogeland',
  description: 'Vote cho Dogeland mỗi ngày để nhận phần thưởng VIP, xu và items đặc biệt.',
};

const VOTE_SITES = [
  {
    name: 'Minecraft-Server.net',
    url: 'https://minecraft-server.net/vote/dogeland',
    description: 'Top Minecraft server list uy tín nhất',
    cooldown: '24 giờ',
    reward: '500 xu',
    icon: '🌐',
  },
  {
    name: 'MinecraftServers.org',
    url: 'https://minecraftservers.org/vote/dogeland',
    description: 'Danh sách server Minecraft phổ biến',
    cooldown: '24 giờ',
    reward: '500 xu',
    icon: '⛏️',
  },
  {
    name: 'TopMinecraftServers.org',
    url: 'https://topminecraftservers.org/vote/dogeland',
    description: 'Vote để leo top bảng xếp hạng',
    cooldown: '24 giờ',
    reward: '500 xu + 1 VoteKey',
    icon: '🏆',
  },
  {
    name: 'Planet Minecraft',
    url: 'https://www.planetminecraft.com/server/dogeland',
    description: 'Cộng đồng Minecraft lớn nhất thế giới',
    cooldown: '24 giờ',
    reward: '500 xu',
    icon: '🌍',
  },
];

const REWARDS = [
  { icon: '💰', label: '2.000 xu / ngày', desc: 'Vote đủ 4 site, nhận tổng 2.000 xu' },
  { icon: '🗝️', label: 'VoteKey x1', desc: 'Mở hộp may mắn với vật phẩm hiếm' },
  { icon: '⭐', label: 'Top voter', desc: 'Người vote nhiều nhất tuần nhận thưởng đặc biệt' },
  { icon: '🎁', label: 'Streak bonus', desc: 'Vote 7 ngày liên tiếp nhận VIP 3 ngày' },
];

export default function VotePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Star size={14} />
          Ủng hộ Dogeland
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-3">Vote để nhận thưởng</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Vote cho chúng tôi mỗi ngày để nhận xu, vật phẩm đặc biệt và giúp server lên top!
        </p>
      </div>

      {/* Rewards overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {REWARDS.map((r) => (
          <div key={r.label} className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className="text-3xl mb-2">{r.icon}</div>
            <p className="font-semibold text-sm">{r.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Vote sites */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Gift size={18} className="text-primary" />
        Các trang vote
      </h2>
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {VOTE_SITES.map((site) => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="text-3xl shrink-0">{site.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{site.name}</span>
                <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{site.description}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-muted px-2 py-0.5">
                  ⏱ {site.cooldown}
                </span>
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">
                  🎁 {site.reward}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* How to vote */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-primary" />
          Hướng dẫn vote
        </h2>
        <ol className="space-y-3">
          {[
            'Click vào từng trang vote ở trên (mỗi trang 1 lần / 24h)',
            'Nhập tên người chơi Minecraft của bạn',
            'Xác nhận vote (có thể cần làm CAPTCHA)',
            'Vào server Dogeland — phần thưởng sẽ tự động gửi qua lệnh /vote claim',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
