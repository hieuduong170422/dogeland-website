'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Users, Coins, Trophy, Headphones } from 'lucide-react';

const FEATURES = [
  {
    icon: <Shield size={24} />,
    title: 'Anti-cheat mạnh',
    description: 'Hệ thống chống hack tự động 24/7. Trải nghiệm fair-play cho tất cả người chơi.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Ping thấp',
    description: 'Server đặt tại Việt Nam, ping trung bình 12ms. Gameplay mượt mà, không lag.',
  },
  {
    icon: <Coins size={24} />,
    title: 'Economy thực tế',
    description: 'Hệ thống Dogecoin độc đáo. Mua bán item, đổi rank, tham gia kinh tế server.',
  },
  {
    icon: <Trophy size={24} />,
    title: 'Leaderboard',
    description: 'Bảng xếp hạng cập nhật realtime. Thi đua, leo rank và nhận phần thưởng.',
  },
  {
    icon: <Users size={24} />,
    title: 'Cộng đồng lớn',
    description: 'Hơn 15,000 người chơi đã đăng ký. Forum, Discord sôi động mỗi ngày.',
  },
  {
    icon: <Headphones size={24} />,
    title: 'Hỗ trợ nhanh',
    description: 'Đội ngũ mod túc trực 16/7. Ticket được xử lý trong vòng 2 giờ.',
  },
];

export function Features() {
  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-black">Tại sao chọn Dogeland?</h2>
          <p className="mt-2 text-muted-foreground">Chúng tôi tạo ra trải nghiệm tốt nhất</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex gap-4 rounded-xl border border-border bg-card/60 p-5"
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {feat.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feat.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
