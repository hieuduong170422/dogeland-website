import { type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: { text: string; link: string; label: string };
  className?: string;
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className={cn('relative z-10 w-full max-w-md', className)}>
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-3xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
              DOGELAND
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {children}

          {footer && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {footer.text}{' '}
              <Link href={footer.link} className="text-primary font-medium hover:underline">
                {footer.label}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
