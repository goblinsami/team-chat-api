"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function CreateWorkspace() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name") || "").trim();
    setError("");
    setMessage("");
    if (name.length < 2) { setError("El nombre debe tener al menos 2 caracteres."); return; }
    setPending(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (response.status === 401) { router.replace("/auth"); router.refresh(); return; }
      if (!response.ok) { setError(data.message); return; }
      form.reset();
      setMessage("Workspace creado.");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally { setPending(false); }
  }

  return (
    <section aria-labelledby="create-title">
      <h2 id="create-title">Crear workspace</h2>
      <form onSubmit={submit}>
        <label htmlFor="workspace-name">Nombre</label>{" "}
        <input id="workspace-name" name="name" minLength={2} required disabled={pending} />{" "}
        <button type="submit" disabled={pending}>{pending ? "Creando…" : "Crear workspace"}</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
