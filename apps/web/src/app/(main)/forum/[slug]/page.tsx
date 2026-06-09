'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { forumApi } from '@/lib/api/forum.api';
import { useIsAuthenticated } from '@/lib/stores/auth.store';
import { ThreadRow } from '@/components/forum/thread-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TiptapEditor } from '@/components/forum/tiptap-editor';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const isAuth = useIsAuthenticated();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['forum', 'threads', slug, page, debouncedSearch],
    queryFn: () => forumApi.getThreads(slug, page, debouncedSearch || undefined),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      forumApi.createThread({ title: newTitle, content: newContent, categorySlug: slug }),
    onSuccess: (thread) => {
      setShowCreate(false);
      setNewTitle('');
      setNewContent('');
      queryClient.invalidateQueries({ queryKey: ['forum', 'threads', slug] });
      toast.success('Đã tạo chủ đề');
      router.push(`/forum/thread/${thread.id}`);
    },
    onError: () => toast.error('Tạo thất bại, thử lại sau'),
  });

  function handleSearchChange(val: string) {
    setSearch(val);
    clearTimeout((window as any).__searchTimer);
    (window as any).__searchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  }

  const canCreate = !newTitle.trim() || newTitle.trim().length < 5 || newContent === '' || newContent === '<p></p>';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/forum" className="hover:text-foreground transition-colors">Diễn đàn</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{data?.category.name ?? slug}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black">{data?.category.name ?? '...'}</h1>
          {data?.category.description && (
            <p className="text-muted-foreground text-sm mt-0.5">{data.category.description}</p>
          )}
        </div>
        {isAuth && (
          <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0">
            <Plus size={16} />
            Tạo chủ đề
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Tìm kiếm chủ đề..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Thread list */}
      <div className="rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse" style={{ opacity: 1 - i * 0.08 }} />
            ))}
          </div>
        ) : !data?.threads.length ? (
          <div className="py-16 text-center text-muted-foreground">
            {search ? 'Không tìm thấy chủ đề nào' : 'Chưa có chủ đề nào — hãy tạo mới!'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.threads.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{data.total} chủ đề</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-muted-foreground">{page} / {data.totalPages}</span>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Create thread dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo chủ đề mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Tiêu đề (5–120 ký tự)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={120}
            />
            <TiptapEditor
              placeholder="Nội dung bài viết..."
              onChange={setNewContent}
              minHeight="200px"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
              <Button onClick={() => createMutation.mutate()} disabled={canCreate || createMutation.isPending}>
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo chủ đề'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
