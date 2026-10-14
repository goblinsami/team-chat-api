import { privatePost } from '@/lib/private-post';

export async function POST(request: Request) {
  const response = await privatePost(request, '/auth/socket-ticket', {});
  if (!response.ok) return response;
  const data = await response.json();
  const { NextResponse } = await import('next/server');
  if (typeof data.ticket !== 'string') return NextResponse.json({ message: 'Respuesta inválida.' }, { status: 502 });
  return NextResponse.json({ ticket: data.ticket, url: process.env.BACKEND_URL }, { headers: { 'Cache-Control': 'no-store' } });
}
