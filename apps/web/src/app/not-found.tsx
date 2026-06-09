import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-8xl font-black text-primary/20">404</p>
        <h1 className="text-2xl font-bold">Trang không tồn tại</h1>
        <p className="text-muted-foreground">Trang bạn đang tìm không có ở đây.</p>
      </div>
      <Button asChild>
        <Link href="/">Về trang chủ</Link>
      </Button>
    </div>
  );
}
