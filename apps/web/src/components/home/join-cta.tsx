'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const SERVER_IP = 'play.dogeland.vn';

export function JoinCta() {
  const [copied, setCopied] = useState(false);

  const copyIP = () => {
    navigator.clipboard.writeText(SERVER_IP).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-10 text-center"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/15%)_0%,_transparent_70%)] pointer-events-none" />

          <div className="relative space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black">
              Sẵn sàng tham gia?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Tạo tài khoản miễn phí và bắt đầu hành trình của bạn tại Dogeland ngay hôm nay.
            </p>

            {/* Steps */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              {[
                { step: '1', text: 'Tải Minecraft Java Edition' },
                { step: '2', text: 'Đăng ký tài khoản' },
                { step: '3', text: 'Vào server bằng IP bên dưới' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {step}
                  </span>
                  <span className="text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            {/* Server IP */}
            <button
              onClick={copyIP}
              className="group mx-auto inline-flex items-center gap-3 rounded-xl border-2 border-primary/40 bg-card px-6 py-3 font-mono text-base font-semibold hover:border-primary transition-colors"
            >
              {SERVER_IP}
              {copied ? (
                <Check size={16} className="text-primary" />
              ) : (
                <Copy size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Đăng ký miễn phí <ArrowRight size={16} />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/support">Cần hỗ trợ?</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
