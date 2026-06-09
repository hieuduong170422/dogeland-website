import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const FOOTER_LINKS = {
  'Server': [
    { label: 'Trang chủ', href: '/' },
    { label: 'Games', href: '/games' },
    { label: 'Bảng xếp hạng', href: '/leaderboard' },
    { label: 'Cửa hàng', href: '/store' },
  ],
  'Cộng đồng': [
    { label: 'Diễn đàn', href: '/forum' },
    { label: 'Wiki', href: '/wiki' },
    { label: 'Discord', href: 'https://discord.gg/dogeland' },
  ],
  'Hỗ trợ': [
    { label: 'Ticket', href: '/support' },
    { label: 'Nội quy', href: '/rules' },
    { label: 'Điều khoản', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <p className="text-xl font-black tracking-tight">DOGELAND</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Server Minecraft Việt Nam — Play, compete, and connect.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              play.dogeland.vn
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <p className="text-sm font-semibold text-foreground">{category}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Dogeland. All rights reserved.</p>
          <p>Not affiliated with Mojang AB or Microsoft.</p>
        </div>
      </div>
    </footer>
  );
}
