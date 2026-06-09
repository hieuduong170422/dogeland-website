'use client';

import { motion } from 'framer-motion';
import { Users, UserCheck, Clock, Zap } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
}

// Animated counter hook
function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return count;
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const count = useCountUp(stat.value, 1200 + index * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 text-center"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {stat.icon}
      </div>
      <p className="text-3xl font-black tabular-nums">
        {count.toLocaleString('vi-VN')}
        {stat.suffix}
      </p>
      <p className="text-sm text-muted-foreground">{stat.label}</p>
    </motion.div>
  );
}

const STATS: Stat[] = [
  { label: 'Đang online', value: 128, icon: <Users size={20} /> },
  { label: 'Người chơi đã đăng ký', value: 15420, icon: <UserCheck size={20} /> },
  { label: 'Giờ uptime', value: 99, suffix: '%', icon: <Clock size={20} /> },
  { label: 'Ping trung bình', value: 12, suffix: 'ms', icon: <Zap size={20} /> },
];

export function ServerStats() {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
