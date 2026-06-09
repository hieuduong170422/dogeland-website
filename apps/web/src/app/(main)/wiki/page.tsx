import { Suspense } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { wikiApi } from '@/lib/api/wiki.api';

async function WikiList() {
  const pages = await wikiApi.listPages();

  if (!pages.length) {
    return (
      <p className="text-muted-foreground text-center py-10">
        Chưa có trang wiki nào.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {pages.map((page) => (
        <Link
          key={page.id}
          href={`/wiki/${page.slug}`}
          className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-md"
        >
          <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
            <BookOpen size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold group-hover:text-primary transition-colors">
              {page.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock size={11} />
              Cập nhật {formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true, locale: vi })}
            </p>
          </div>
          <ChevronRight
            size={16}
            className="text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all shrink-0"
          />
        </Link>
      ))}
    </div>
  );
}

export default function WikiIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <BookOpen className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Wiki</h1>
          <p className="text-muted-foreground mt-0.5">Hướng dẫn và tài liệu về Dogeland</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <WikiList />
      </Suspense>
    </div>
  );
}

export const revalidate = 300;
