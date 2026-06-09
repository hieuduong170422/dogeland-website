'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import { Bold, Italic, List, ListOrdered, Code, Link2, Quote } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface TiptapEditorProps {
  content?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  minHeight?: string;
}

export function TiptapEditor({
  content = '',
  placeholder = 'Viết nội dung...',
  onChange,
  minHeight = '160px',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlock,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: 'Quote' },
    { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock'), title: 'Code' },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Bullet list' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Numbered list' },
  ];

  return (
    <div className="rounded-xl border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/50">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
        {tools.map(({ icon: Icon, action, active, title }) => (
          <button
            key={title}
            type="button"
            title={title}
            onClick={action}
            className={cn(
              'rounded p-1.5 transition-colors',
              active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none px-4 py-3 focus:outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}

// Read-only renderer for post content
export function PostContent({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
        'prose-pre:bg-muted prose-pre:border prose-pre:border-border',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
