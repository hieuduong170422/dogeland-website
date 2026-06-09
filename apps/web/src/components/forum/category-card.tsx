import Link from 'next/link';
import { MessageSquare, ChevronRight } from 'lucide-react';
import type { ForumCategory } from '@/lib/api/forum.api';

const CATEGORY_ICONS: Record<string, string> = {
  announcements: '📢',
  general: '💬',
  technical: '🔧',
  introductions: '👋',
  reports: '🚩',
};

export function CategoryCard({ category }: { category: ForumCategory }) {
  const icon = CATEGORY_ICONS[category.slug] ?? '📁';

  return (
    <Link
      href={`/forum/${category.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-md"
    >
      <div className="text-2xl shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {category.name}
        </p>
        {category.description && (
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{category.description}</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0 text-muted-foreground">
        <div className="flex items-center gap-1 text-sm">
          <MessageSquare size={14} />
          <span>{category._count.threads}</span>
        </div>
        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
