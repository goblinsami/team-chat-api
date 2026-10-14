import { NextResponse } from "next/server";
import { workspaceRequest } from "@/lib/workspaces";

export async function POST(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Solicitud no permitida." }, { status: 403 });
  }
  const { workspaceId } = await params;
  const id = Number(workspaceId);
  if (!/^\d+$/.test(workspaceId) || !Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json({ message: "Workspace inválido." }, { status: 400 });
  }
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: "Datos inválidos." }, { status: 400 }); }
  if (!body || typeof body.name !== "string" || body.name.trim().length < 2) {
    return NextResponse.json({ message: "El nombre debe tener al menos 2 caracteres." }, { status: 400 });
  }
  const result = await workspaceRequest("POST", body.name.trim(), id);
  if (!result.data) {
    const message = result.status === 401 ? "Tu sesión ha caducado."
      : result.status === 403 ? "No tienes permisos para crear canales en este workspace."
      : "No se pudo crear el canal. Inténtalo de nuevo.";
    const response = NextResponse.json({ message }, { status: result.status });
    if (result.status === 401) response.cookies.delete("access_token");
    return response;
  }
  return NextResponse.json({ id: result.data.id, name: result.data.name }, { status: 201 });
}
