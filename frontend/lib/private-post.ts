import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function privatePost(request: Request, path: string, body: object) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ message: 'Solicitud no permitida.' }, { status: 403 });
  const token = (await cookies()).get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Inicia sesión de nuevo.' }, { status: 401 });
  const url = process.env.BACKEND_URL;
  if (!url) return NextResponse.json({ message: 'Servicio no configurado.' }, { status: 503 });
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}${path}`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body), cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const message = response.status === 401 ? 'Tu sesión ha caducado.'
        : response.status === 403 ? 'No tienes permisos para invitar usuarios.'
        : response.status === 404 ? 'El usuario debe registrarse antes de ser invitado.' : 'No se pudo completar la solicitud.';
      return NextResponse.json({ message }, { status: response.status });
    }
    return NextResponse.json(await response.json(), { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ message: 'No se pudo conectar con el servidor.' }, { status: 502 });
  }
}
