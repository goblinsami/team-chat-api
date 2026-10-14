import { NextResponse } from "next/server";

export async function handleAuth(request: Request, register: boolean) {
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Solicitud no permitida." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Datos inválidos." }, { status: 400 });
  }
  if (!body || typeof body.email !== "string" || typeof body.password !== "string" ||
      !body.email.trim() || !body.password ||
      (register && (typeof body.name !== "string" || !body.name.trim() || body.password.length < 8))) {
    return NextResponse.json({ message: "Completa los campos correctamente." }, { status: 400 });
  }

  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) {
    return NextResponse.json({ message: "El servicio no está configurado." }, { status: 503 });
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/${register ? "users" : "auth/login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email.trim(), password: body.password, ...(register ? { name: body.name.trim() } : {}) }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const message = response.status === 401 ? "Email o contraseña incorrectos."
        : response.status === 409 ? "Ya existe una cuenta con ese email."
        : response.status === 400 ? "Revisa los datos introducidos."
        : "No se pudo completar la solicitud. Inténtalo de nuevo.";
      return NextResponse.json({ message }, { status: response.status });
    }
    if (register) {
      return NextResponse.json({ message: "Cuenta creada. Inicia sesión." }, { status: 201 });
    }
    const data = await response.json();
    if (typeof data.accessToken !== "string" || !data.accessToken) {
      throw new Error("Invalid login response");
    }
    const result = NextResponse.json({ message: "Sesión iniciada correctamente." });
    result.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
    return result;
  } catch {
    return NextResponse.json({ message: "No se pudo conectar con el servidor. Inténtalo de nuevo." }, { status: 502 });
  }
}
