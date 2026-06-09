'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Pencil, Clock, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { wikiApi } from '@/lib/api/wiki.api';
import { useUser } from '@/lib/stores/auth.store';
import { WikiEditor } from '@/components/wiki/wiki-editor';
import { PostContent } from '@/components/forum/tiptap-editor';
import { Button } from '@/components/ui/button';

export default function WikiPage() {
  const { slug } = useParams<{ slug: string }>();
  const user = useUser();
  const [editing, setEditing] = useState(false);

  const { data: page, isLoading } = useQuery({
    queryKey: ['wiki', slug],
    queryFn: () => wikiApi.getPage(slug),
  });

  const canEdit = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
        <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted animate-pulse rounded" style={{ width: `${90 - i * 5}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Trang không tồn tại.</p>
        <Link href="/wiki" className="text-primary hover:underline text-sm mt-2 inline-block">
          ← Quay lại Wiki
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/wiki" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ChevronLeft size={14} /> Wiki
        </Link>
        <span>/</span>
        <span className="text-foreground">{page.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">{page.title}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={11} />
            Cập nhật {formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true, locale: vi })}
          </p>
        </div>
        {canEdit && !editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="shrink-0 gap-1.5"
          >
            <Pencil size={13} /> Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Editor (MOD/ADMIN only) */}
      {editing && (
        <WikiEditor page={page} onClose={() => setEditing(false)} />
      )}

      {/* Content */}
      {!editing && (
        <div className="rounded-xl border border-border bg-card px-6 py-6">
          <PostContent html={page.content} />
        </div>
      )}

      {/* Footer nav */}
      <Link
        href="/wiki"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft size={14} /> Tất cả trang wiki
      </Link>
    </div>
  );
}
