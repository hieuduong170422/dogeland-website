'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Three.js must be client-only — never SSR
const HeroScene = dynamic(
  () => import('./hero-scene').then((m) => m.HeroScene),
  { ssr: false },
);

const SERVER_IP = 'play.dogeland.vn';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function Hero() {
  const [copied, setCopied] = useState(false);

  const copyIP = () => {
    navigator.clipboard.writeText(SERVER_IP).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
      {/* 3D background */}
      <div className="absolute inset-0 z-0">
        <HeroScene />
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/60 via-background/40 to-background" />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-20 mx-auto max-w-4xl px-4 text-center"
      >
        {/* Status badge */}
        <motion.div variants={item} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Server đang hoạt động
        </motion.div>

        {/* Main title */}
        <motion.h1
          variants={item}
          className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-foreground"
        >
          DOGELAND
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto"
        >
          Trải nghiệm Minecraft Việt Nam tốt nhất. Survival, Skyblock, Minigames và còn nhiều hơn nữa.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={item} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/register">
              Tham gia ngay <ArrowRight size={16} />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/games">Xem các game</Link>
          </Button>
        </motion.div>

        {/* Server IP */}
        <motion.div variants={item} className="mt-6">
          <button
            onClick={copyIP}
            className="group inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 backdrop-blur-sm px-4 py-2.5 font-mono text-sm transition-all hover:border-primary/50 hover:bg-card"
          >
            <span className="text-muted-foreground">IP:</span>
            <span className="font-semibold">{SERVER_IP}</span>
            {copied ? (
              <Check size={14} className="text-primary" />
            ) : (
              <Copy size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
    </section>
  );
}
