import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';
import { ServerStats } from '@/components/home/server-stats';
import { GameModes } from '@/components/home/game-modes';
import { Features } from '@/components/home/features';
import { JoinCta } from '@/components/home/join-cta';

export const metadata: Metadata = {
  title: 'Dogeland — Minecraft Server Việt Nam',
  description:
    'Server Minecraft Việt Nam tốt nhất. Survival, Skyblock, Bedwars, Minigames. Tham gia cộng đồng hơn 15,000 người chơi.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServerStats />
      <GameModes />
      <Features />
      <JoinCta />
    </>
  );
}
