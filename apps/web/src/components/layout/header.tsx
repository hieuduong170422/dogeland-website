'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenu } from './user-menu';
import { NAV_LINKS } from './nav-links';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useIsAuthenticated, useAuthStore } from '@/lib/stores/auth.store';

export function Header() {
  const pathname = usePathname();
  const isAuth = useIsAuthenticated();
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
            DOGELAND
          </span>
          <span className="hidden sm:inline text-xs text-muted-foreground font-mono">1.20.x</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Server IP chip */}
          <button
            onClick={() => navigator.clipboard?.writeText('play.dogeland.vn').then(() => {})}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary hover:bg-primary/20 transition-colors"
            title="Click để copy IP"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            play.dogeland.vn
          </button>

          <NotificationBell />

          {isLoaded ? (
            isAuth ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </div>
            )
          ) : (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          )}

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu size={20} />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-black">DOGELAND</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-6 py-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                      pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuth && (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button variant="outline" asChild onClick={() => setMobileOpen(false)}>
                      <Link href="/login">Đăng nhập</Link>
                    </Button>
                    <Button asChild onClick={() => setMobileOpen(false)}>
                      <Link href="/register">Đăng ký</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
