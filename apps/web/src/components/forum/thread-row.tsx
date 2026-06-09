import Link from 'next/link';
import Image from 'next/image';
import { Pin, Lock, MessageSquare, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';
import type { ForumThread } from '@/lib/api/forum.api';

export function ThreadRow({ thread }: { thread: ForumThread }) {
  const timeAgo = formatDistanceToNow(new Date(thread.updatedAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div
      className={cn(
        'flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30',
        thread.isPinned && 'bg-primary/5',
      )}
    >
      {/* Avatar */}
      <Image
        src={`https://mc-heads.net/avatar/${thread.author.username}/40`}
        alt={thread.author.username}
        width={40}
        height={40}
        unoptimized
        className="rounded-lg shrink-0 mt-0.5"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {thread.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Pin size={10} /> Ghim
            </span>
          )}
          {thread.isLocked && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              <Lock size={10} /> Khóa
            </span>
          )}
          <Link
            href={`/forum/thread/${thread.id}`}
            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
          >
            {thread.title}
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          <Link href={`/player/${thread.author.username}`} className="hover:text-foreground transition-colors">
            {thread.author.username}
          </Link>
          <span className="mx-1">·</span>
          {timeAgo}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 shrink-0 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageSquare size={14} />
          <span>{thread._count.posts}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <Eye size={14} />
          <span>{thread.viewCount}</span>
        </div>
      </div>
    </div>
  );
}
