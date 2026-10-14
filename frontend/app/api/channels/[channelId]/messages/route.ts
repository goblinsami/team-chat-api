import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ channelId: string }> }) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Solicitud no permitida." }, { status: 403 });
  }
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return NextResponse.json({ message: "Inicia sesión de nuevo." }, { status: 401 });
  const { channelId } = await params;
  const id = Number(channelId);
  if (!/^\d+$/.test(channelId) || !Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json({ message: "Canal inválido." }, { status: 400 });
  }
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: "Datos inválidos." }, { status: 400 }); }
  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return NextResponse.json({ message: "Escribe un mensaje." }, { status: 400 });
  }
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) return NextResponse.json({ message: "El servicio no está configurado." }, { status: 503 });
  try {
    const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/channels/${id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: body.text.trim() }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!upstream.ok) {
      const message = upstream.status === 401 ? "Tu sesión ha caducado."
        : upstream.status === 403 ? "No tienes permiso para enviar mensajes en este canal."
        : upstream.status === 404 ? "El canal no existe."
        : "No se pudo enviar el mensaje. Inténtalo de nuevo.";
      const response = NextResponse.json({ message }, { status: upstream.status });
      if (upstream.status === 401) response.cookies.delete("access_token");
      return response;
    }
    return NextResponse.json({ message: "Mensaje enviado." }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "No se pudo conectar con el servidor." }, { status: 502 });
  }
}
