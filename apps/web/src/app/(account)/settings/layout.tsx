'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShieldCheck, Bell } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const SETTINGS_NAV = [
  { label: 'Hồ sơ', href: '/settings/profile', icon: User },
  { label: 'Bảo mật', href: '/settings/security', icon: ShieldCheck },
  { label: 'Thông báo', href: '/settings/notifications', icon: Bell },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-black mb-8">Cài đặt tài khoản</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-48 shrink-0">
          <nav className="flex md:flex-col gap-1">
            {SETTINGS_NAV.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
