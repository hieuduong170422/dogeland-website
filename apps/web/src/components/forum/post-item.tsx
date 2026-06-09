'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils/cn';
import { forumApi, type ForumPost } from '@/lib/api/forum.api';
import { useUser } from '@/lib/stores/auth.store';
import { PostContent } from './tiptap-editor';

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  ADMIN: { label: 'ADMIN', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  MODERATOR: { label: 'MOD', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  PLAYER: { label: 'PLAYER', className: 'bg-muted text-muted-foreground border-border' },
};

interface PostItemProps {
  post: ForumPost;
  threadId: string;
  index: number;
}

export function PostItem({ post, threadId, index }: PostItemProps) {
  const user = useUser();
  const queryClient = useQueryClient();

  const reactMutation = useMutation({
    mutationFn: (type: 'like' | 'dislike') => forumApi.react(post.id, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forum', 'posts', threadId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => forumApi.deletePost(post.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forum', 'posts', threadId] }),
  });

  const likes = post.reactions.filter((r) => r.type === 'like').length;
  const dislikes = post.reactions.filter((r) => r.type === 'dislike').length;
  const myReaction = user ? post.reactions.find((r) => r.userId === user.id) : null;
  const canDelete = user && (user.id === post.authorId || user.role === 'ADMIN' || user.role === 'MODERATOR');

  const badge = ROLE_BADGE[post.author.role] ?? ROLE_BADGE.PLAYER;

  return (
    <div className="flex gap-4 py-5 px-6 border-b border-border last:border-0">
      {/* Left: avatar + author info */}
      <div className="flex flex-col items-center gap-2 w-20 shrink-0 text-center">
        <Link href={`/player/${post.author.username}`}>
          <Image
            src={`https://mc-heads.net/avatar/${post.author.username}/48`}
            alt={post.author.username}
            width={48}
            height={48}
            unoptimized
            className="rounded-lg hover:ring-2 ring-primary/50 transition-all"
          />
        </Link>
        <Link
          href={`/player/${post.author.username}`}
          className="text-xs font-semibold hover:text-primary transition-colors break-all"
        >
          {post.author.username}
        </Link>
        <span className={cn('text-[10px] font-bold border rounded-full px-1.5 py-0.5', badge.className)}>
          {badge.label}
        </span>
        <span className="text-[10px] text-muted-foreground">#{index + 1}</span>
      </div>

      {/* Right: content + actions */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
          </span>
          {canDelete && (
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <PostContent html={post.content} />

        {/* Reactions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => user && reactMutation.mutate('like')}
            disabled={!user || reactMutation.isPending}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm border transition-all',
              myReaction?.type === 'like'
                ? 'bg-green-500/20 border-green-500/40 text-green-400'
                : 'border-border text-muted-foreground hover:border-green-500/40 hover:text-green-400',
            )}
          >
            <ThumbsUp size={13} />
            <span>{likes}</span>
          </button>
          <button
            onClick={() => user && reactMutation.mutate('dislike')}
            disabled={!user || reactMutation.isPending}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm border transition-all',
              myReaction?.type === 'dislike'
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'border-border text-muted-foreground hover:border-red-500/40 hover:text-red-400',
            )}
          >
            <ThumbsDown size={13} />
            <span>{dislikes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
