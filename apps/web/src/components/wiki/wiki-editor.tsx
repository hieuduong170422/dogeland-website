'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { wikiApi, type WikiPage } from '@/lib/api/wiki.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TiptapEditor } from '@/components/forum/tiptap-editor';

interface WikiEditorProps {
  page: WikiPage;
  onClose: () => void;
}

export function WikiEditor({ page, onClose }: WikiEditorProps) {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => wikiApi.updatePage(page.slug, { title, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki', page.slug] });
      queryClient.invalidateQueries({ queryKey: ['wiki'] });
      toast.success('Đã lưu trang wiki');
      onClose();
    },
    onError: () => toast.error('Lưu thất bại'),
  });

  return (
    <div className="space-y-4 rounded-xl border border-primary/40 bg-primary/5 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary flex items-center gap-1.5">
          <Pencil size={14} /> Chỉnh sửa trang
        </span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>
      </div>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề trang"
        className="text-lg font-semibold"
      />
      <TiptapEditor content={content} onChange={setContent} minHeight="300px" />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-2">
          <Save size={14} />
          {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </div>
  );
}
