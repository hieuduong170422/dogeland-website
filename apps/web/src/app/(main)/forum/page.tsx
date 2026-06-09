import { Suspense } from 'react';
import { MessageSquare } from 'lucide-react';
import { forumApi } from '@/lib/api/forum.api';
import { CategoryCard } from '@/components/forum/category-card';

async function CategoriesList() {
  const categories = await forumApi.getCategories();
  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
}

export default function ForumPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <MessageSquare className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Diễn đàn</h1>
          <p className="text-muted-foreground mt-0.5">Cộng đồng Dogeland — Cùng nhau thảo luận</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <CategoriesList />
      </Suspense>
    </div>
  );
}

export const revalidate = 60;
