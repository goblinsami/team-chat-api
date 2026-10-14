"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setPending(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: fields.get("password"), ...(isRegister ? { name: fields.get("name") } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "No se pudo completar la solicitud.");
        return;
      }
      form.reset();
      setMessage(data.message);
      if (isRegister) setIsRegister(false);
      else {
        router.replace("/dashboard");
        router.refresh();
      }
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  function switchForm(register: boolean) {
    setIsRegister(register);
    setError("");
    setMessage("");
  }
  return (
    <main>
      <h1>Accede a Team Chat</h1>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {!isRegister ? (
      <section aria-labelledby="login-title">
        <h2 id="login-title">Iniciar sesión</h2>
        <form onSubmit={submit}>
          <p>
            <label htmlFor="login-email">Email</label>{" "}
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </p>
          <p>
            <label htmlFor="login-password">Contraseña</label>{" "}
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </p>
          <button type="submit" disabled={pending}>
            {pending ? "Enviando…" : "Iniciar sesión"}
          </button>
        </form>
        <p>
          ¿No tienes cuenta?{" "}
          <button type="button" disabled={pending} onClick={() => switchForm(true)}>Registrarse</button>
        </p>
      </section>
      ) : (
      <section aria-labelledby="register-title">
        <h2 id="register-title">Registrarse</h2>
        <form onSubmit={submit}>
          <p>
            <label htmlFor="register-name">Nombre</label>{" "}
            <input
              id="register-name"
              name="name"
              autoComplete="name"
              required
            />
          </p>
          <p>
            <label htmlFor="register-email">Email</label>{" "}
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </p>
          <p>
            <label htmlFor="register-password">Contraseña</label>{" "}
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </p>
          <button type="submit" disabled={pending}>
            {pending ? "Enviando…" : "Crear cuenta"}
          </button>
        </form>
        <p>
          ¿Ya tienes cuenta?{" "}
          <button type="button" disabled={pending} onClick={() => switchForm(false)}>Iniciar sesión</button>
        </p>
      </section>
      )}
      <p>
        <Link href="/">Volver al inicio</Link>
      </p>
    </main>
  );
}
