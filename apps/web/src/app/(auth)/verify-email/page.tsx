'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';
import { AuthCard } from '@/components/auth/auth-card';

type State = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setState('error');
      setMessage('Link xác minh không hợp lệ.');
      return;
    }

    authApi
      .verifyEmail(token)
      .then((res) => {
        setState('success');
        setMessage(res.message);
        setTimeout(() => router.push('/login'), 3000);
      })
      .catch((err) => {
        setState('error');
        setMessage(err?.response?.data?.message ?? 'Link xác minh đã hết hạn hoặc không hợp lệ.');
      });
  }, []);

  return (
    <AuthCard title="Xác minh Email">
      <div className="flex flex-col items-center gap-4 py-6">
        {state === 'loading' && (
          <>
            <Loader2 size={48} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang xác minh...</p>
          </>
        )}
        {state === 'success' && (
          <>
            <CheckCircle2 size={48} className="text-primary" />
            <p className="text-center text-sm text-muted-foreground">{message}</p>
            <p className="text-xs text-muted-foreground">Đang chuyển đến trang đăng nhập...</p>
          </>
        )}
        {state === 'error' && (
          <>
            <XCircle size={48} className="text-destructive" />
            <p className="text-center text-sm text-muted-foreground">{message}</p>
            <a href="/login" className="text-sm text-primary hover:underline">
              Về trang đăng nhập
            </a>
          </>
        )}
      </div>
    </AuthCard>
  );
}
