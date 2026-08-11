"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getCurrentUser } from '@/lib/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
  : 'http://localhost:5000';

export function useSocket(onNotificationReceived?: (notification: any) => void) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    const token = typeof window !== 'undefined' ? localStorage.getItem('hapkido_token') : null;

    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
      query: { token },
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      if (user?.id) {
        socketInstance.emit('register_user', user.id);
      }
    });

    socketInstance.on('notification', (newNotif: any) => {
      if (onNotificationReceived) {
        onNotificationReceived(newNotif);
      }
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, connected };
}
