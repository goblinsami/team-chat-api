"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function CreateMessage({ channelId }: { channelId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const text = String(new FormData(form).get("text") || "").trim();
    setError("");
    setMessage("");
    if (!text) { setError("Escribe un mensaje."); return; }
    setPending(true);
    try {
      const response = await fetch(`/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (response.status === 401) { router.replace("/auth"); router.refresh(); return; }
      if (!response.ok) { setError(data.message || "No se pudo enviar el mensaje."); return; }
      form.reset();
      setMessage("Mensaje enviado.");
      router.replace(window.location.pathname);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally { setPending(false); }
  }

  return (
    <section aria-labelledby="create-message-title">
      <h2 id="create-message-title">Enviar mensaje</h2>
      <form onSubmit={submit}>
        <p><label htmlFor="message-text">Mensaje</label></p>
        <p><textarea id="message-text" name="text" required disabled={pending} /></p>
        <button type="submit" disabled={pending}>{pending ? "Enviando…" : "Enviar mensaje"}</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
