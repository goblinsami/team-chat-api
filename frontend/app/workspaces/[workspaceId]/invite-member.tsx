'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function InviteMember({ workspaceId }: { workspaceId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const email = String(new FormData(form).get('email') || '').trim();
    setPending(true); setError(''); setMessage('');
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (response.status === 401) { router.replace('/auth'); return; }
      if (!response.ok) { setError(data.message); return; }
      form.reset(); setMessage('Usuario añadido al workspace. Ya puede entrar y escribir en sus canales.'); router.refresh();
    } catch { setError('No se pudo conectar con el servidor.'); }
    finally { setPending(false); }
  }
  return <section><h2>Invitar usuario</h2><p>Introduce el email de una cuenta ya registrada.</p><form onSubmit={submit}><label htmlFor="invite-email">Email</label>{' '}<input id="invite-email" name="email" type="email" required disabled={pending} />{' '}<button disabled={pending}>{pending ? 'Invitando…' : 'Invitar'}</button></form>{error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}</section>;
}
