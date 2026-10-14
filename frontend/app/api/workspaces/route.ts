import { NextResponse } from "next/server";
import { workspaceRequest } from "@/lib/workspaces";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Solicitud no permitida." }, { status: 403 });
  }
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: "Datos inválidos." }, { status: 400 }); }
  if (!body || typeof body.name !== "string" || body.name.trim().length < 2) {
    return NextResponse.json({ message: "El nombre debe tener al menos 2 caracteres." }, { status: 400 });
  }
  const result = await workspaceRequest("POST", body.name.trim());
  if (!result.data) {
    const response = NextResponse.json({ message: result.status === 401
      ? "Tu sesión ha caducado. Inicia sesión de nuevo."
      : "No se pudo crear el workspace. Inténtalo de nuevo." }, { status: result.status });
    if (result.status === 401) response.cookies.delete("access_token");
    return response;
  }
  return NextResponse.json({ id: result.data.id, name: result.data.name }, { status: 201 });
}
