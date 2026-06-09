'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { forumApi } from '@/lib/api/forum.api';
import { Button } from '@/components/ui/button';
import { TiptapEditor } from './tiptap-editor';

interface ReplyEditorProps {
  threadId: string;
  isLocked: boolean;
}

export function ReplyEditor({ threadId, isLocked }: ReplyEditorProps) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => forumApi.createPost(threadId, content),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['forum', 'posts', threadId] });
      toast.success('Đã gửi bài viết');
    },
    onError: () => toast.error('Gửi thất bại, thử lại sau'),
  });

  const isEmpty = content === '' || content === '<p></p>';

  if (isLocked) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 text-center text-sm text-muted-foreground">
        Chủ đề này đã bị khóa — không thể trả lời
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground">Trả lời</h3>
      <TiptapEditor
        key={content === '' ? 'reset' : 'editing'}
        placeholder="Viết bài trả lời..."
        onChange={setContent}
      />
      <div className="flex justify-end">
        <Button
          onClick={() => mutation.mutate()}
          disabled={isEmpty || mutation.isPending}
          className="gap-2"
        >
          <Send size={14} />
          {mutation.isPending ? 'Đang gửi...' : 'Gửi bài'}
        </Button>
      </div>
    </div>
  );
}
