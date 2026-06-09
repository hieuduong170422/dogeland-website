'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GameMode {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  players: number;
  href: string;
  featured?: boolean;
}

const GAME_MODES: GameMode[] = [
  {
    id: 'survival',
    name: 'Survival',
    description: 'Sinh tồn cùng cộng đồng. Xây dựng, khai thác, tồn tại. Economy thực tế với Dogecoin.',
    emoji: '⛏️',
    color: 'from-green-500/20 to-emerald-500/10',
    players: 64,
    href: '/games/survival',
    featured: true,
  },
  {
    id: 'skyblock',
    name: 'Skyblock',
    description: 'Bắt đầu từ một hòn đảo nhỏ và xây dựng đế chế của riêng bạn trên bầu trời.',
    emoji: '☁️',
    color: 'from-blue-500/20 to-sky-500/10',
    players: 32,
    href: '/games/skyblock',
  },
  {
    id: 'bedwars',
    name: 'Bedwars',
    description: 'Bảo vệ giường của bạn và phá hủy giường của đối thủ. PvP căng thẳng nhất.',
    emoji: '🛏️',
    color: 'from-red-500/20 to-rose-500/10',
    players: 48,
    href: '/games/bedwars',
    featured: true,
  },
  {
    id: 'minigames',
    name: 'Minigames',
    description: 'Hàng chục minigame thú vị. Spleef, Parkour, TNT Run và nhiều hơn nữa.',
    emoji: '🎮',
    color: 'from-purple-500/20 to-violet-500/10',
    players: 24,
    href: '/games/minigames',
  },
];

function GameCard({ mode, index }: { mode: GameMode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        href={mode.href}
        className={cn(
          'group relative flex flex-col gap-4 rounded-xl border border-border p-6 transition-all duration-300',
          'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1',
          'bg-gradient-to-br',
          mode.color,
          mode.featured && 'ring-1 ring-primary/20',
        )}
      >
        {mode.featured && (
          <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            Phổ biến
          </span>
        )}

        <div className="flex items-start justify-between">
          <span className="text-4xl">{mode.emoji}</span>
          <div className="flex items-center gap-1.5 rounded-full bg-background/50 px-2.5 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            {mode.players} online
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-foreground">{mode.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{mode.description}</p>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Xem thêm <ArrowRight size={14} />
        </div>
      </Link>
    </motion.div>
  );
}

export function GameModes() {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-black">Chế độ chơi</h2>
          <p className="mt-2 text-muted-foreground">Đa dạng trải nghiệm, không bao giờ chán</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAME_MODES.map((mode, i) => (
            <GameCard key={mode.id} mode={mode} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
