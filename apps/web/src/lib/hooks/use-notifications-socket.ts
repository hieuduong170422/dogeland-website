'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/api/client';
import { useIsAuthenticated } from '@/lib/stores/auth.store';

const WS_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1')
  .replace('/api/v1', '');

export function useNotificationsSocket() {
  const isAuthenticated = useIsAuthenticated();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${WS_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('notification', (notif: { title: string; message: string }) => {
      // Show toast
      toast.info(notif.title, { description: notif.message });
      // Invalidate badge count and list
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, queryClient]);
}
