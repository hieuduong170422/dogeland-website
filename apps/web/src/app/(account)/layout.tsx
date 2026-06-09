'use client';

import { useIsAuthenticated } from '@/lib/stores/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const isAuth = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (!isAuth) router.replace('/login');
  }, [isAuth, router]);

  if (!isAuth) return null;

  return <>{children}</>;
}
