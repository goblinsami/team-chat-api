"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Channel } from "@/lib/workspaces";

export function CreateChannel({ workspaceId, onCreated }: { workspaceId: number; onCreated?: (channel: Channel) => void }) {
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
      const response = await fetch(`/api/workspaces/${workspaceId}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (response.status === 401) { router.replace("/auth"); router.refresh(); return; }
      if (!response.ok) { setError(data.message || "No se pudo crear el canal."); return; }
      onCreated?.(data);
      form.reset();
      setMessage("Canal creado.");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally { setPending(false); }
  }

  return (
    <section aria-labelledby="create-channel-title">
      <h2 id="create-channel-title">Crear canal</h2>
      <form onSubmit={submit}>
        <label htmlFor="channel-name">Nombre</label>{" "}
        <input id="channel-name" name="name" minLength={2} required disabled={pending} />{" "}
        <button type="submit" disabled={pending}>{pending ? "Creando…" : "Crear canal"}</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
