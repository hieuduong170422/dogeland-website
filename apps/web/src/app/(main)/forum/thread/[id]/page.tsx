'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Eye, MessageSquare, Lock, Pin } from 'lucide-react';
import Link from 'next/link';
import { forumApi } from '@/lib/api/forum.api';
import { useIsAuthenticated } from '@/lib/stores/auth.store';
import { PostItem } from '@/components/forum/post-item';
import { ReplyEditor } from '@/components/forum/reply-editor';
import { Button } from '@/components/ui/button';

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const isAuth = useIsAuthenticated();
  const [page, setPage] = useState(1);

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['forum', 'thread', id],
    queryFn: () => forumApi.getThread(id),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['forum', 'posts', id, page],
    queryFn: () => forumApi.getPosts(id, page),
    enabled: !!thread,
  });

  if (threadLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <div className="h-8 w-2/3 bg-muted animate-pulse rounded" />
        <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-muted-foreground">
        Chủ đề không tồn tại
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href="/forum" className="hover:text-foreground transition-colors">Diễn đàn</Link>
        <span>/</span>
        <Link
          href={`/forum/${(thread as any).category?.slug ?? ''}`}
          className="hover:text-foreground transition-colors"
        >
          {(thread as any).category?.name ?? ''}
        </Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{thread.title}</span>
      </div>

      {/* Thread header */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 flex-wrap">
          {thread.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              <Pin size={11} /> Ghim
            </span>
          )}
          {thread.isLocked && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <Lock size={11} /> Đã khóa
            </span>
          )}
        </div>
        <h1 className="text-2xl font-black leading-snug">{thread.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <Link href={`/player/${thread.author.username}`} className="hover:text-foreground transition-colors font-medium">
            {thread.author.username}
          </Link>
          <span className="flex items-center gap-1">
            <MessageSquare size={13} />
            {thread._count.posts} bài viết
          </span>
          <span className="flex items-center gap-1">
            <Eye size={13} />
            {thread.viewCount} lượt xem
          </span>
        </div>
      </div>

      {/* Posts */}
      <div className="rounded-xl border border-border overflow-hidden">
        {postsLoading ? (
          <div className="space-y-1 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          postsData?.posts.map((post, i) => (
            <PostItem
              key={post.id}
              post={post}
              threadId={id}
              index={(page - 1) * 20 + i}
            />
          ))
        )}
      </div>

      {/* Post pagination */}
      {postsData && postsData.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{postsData.total} bài viết</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-muted-foreground">{page} / {postsData.totalPages}</span>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => p + 1)} disabled={page >= postsData.totalPages}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Reply editor */}
      {isAuth ? (
        <ReplyEditor threadId={id} isLocked={thread.isLocked} />
      ) : (
        <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link> để trả lời chủ đề này
        </div>
      )}
    </div>
  );
}
