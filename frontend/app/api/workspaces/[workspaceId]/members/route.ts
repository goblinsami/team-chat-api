import { NextResponse } from 'next/server';
import { privatePost } from '@/lib/private-post';

export async function POST(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  if (!/^\d+$/.test(workspaceId) || !Number.isSafeInteger(Number(workspaceId)) || Number(workspaceId) < 1) return NextResponse.json({ message: 'Workspace inválido.' }, { status: 400 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ message: 'Datos inválidos.' }, { status: 400 }); }
  if (!body || typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return NextResponse.json({ message: 'Introduce un email válido.' }, { status: 400 });
  return privatePost(request, `/workspaces/${workspaceId}/members`, { email: body.email.trim() });
}
