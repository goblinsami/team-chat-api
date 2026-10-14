'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import type { Message } from '@/lib/messages';

export function LiveMessages({ channelId, initialMessages }: { channelId: number; initialMessages: Message[] }) {
  const router = useRouter();
  const [received, setReceived] = useState<Message[]>([]);
  const [status, setStatus] = useState('Conectando…');
  useEffect(() => {
    let stopped = false;
    let socket: ReturnType<typeof io> | undefined;
    async function ticket() {
      const response = await fetch('/api/auth/socket-ticket', { method: 'POST' });
      if (response.status === 401) { router.replace('/auth'); throw Error('Sesión caducada.'); }
      const data = await response.json();
      if (!response.ok) throw Error(data.message || 'No se pudo conectar.');
      return data;
    }
    async function connect() {
      try {
        const first = await ticket();
        if (stopped) return;
        let firstTicket: string | undefined = first.ticket;
        socket = io(first.url, {
          autoConnect: false, transports: ['websocket'],
          auth: (callback) => {
            if (firstTicket) { callback({ ticket: firstTicket }); firstTicket = undefined; }
            else ticket().then((data) => { if (!stopped) callback({ ticket: data.ticket }); }).catch((error) => { if (!stopped) setStatus(error.message); });
          },
        });
        socket.on('connect', () => {
          socket!.timeout(10000).emit('channel:join', channelId, (error: Error | null, result: { success: boolean }) => {
            if (stopped) return;
            setStatus(!error && result?.success ? 'Conectado en directo.' : 'No se pudo entrar en el canal.');
            if (!error && result?.success) router.refresh();
          });
        });
        socket.on('message:new', (message: Message & { channelId: number }) => {
          if (message.channelId === channelId && typeof message.text === 'string' && message.user?.name && Number.isInteger(message.id)) {
            setReceived((items) => items.some((item) => item.id === message.id) ? items : [...items, message]);
          }
        });
        socket.on('connect_error', () => setStatus('Error de conexión. Reintentando…'));
        socket.on('disconnect', (reason) => setStatus(reason === 'io server disconnect' ? 'Sesión desconectada. Recarga para reconectar.' : 'Desconectado. Reintentando…'));
        socket.connect();
      } catch (error) { if (!stopped) setStatus(error instanceof Error ? error.message : 'No se pudo conectar.'); }
    }
    void connect();
    return () => { stopped = true; socket?.disconnect(); };
  }, [channelId, router]);
  const messages = [...initialMessages, ...received.filter((item) => !initialMessages.some((message) => message.id === item.id))].sort((a, b) => b.id - a.id);
  return <><p role="status">{status}</p>{messages.length === 0 ? <p>Todavía no hay mensajes.</p> : <ul>{messages.map((message) => <li key={message.id}><strong>{message.user.name}</strong>: {message.text}</li>)}</ul>}</>;
}
