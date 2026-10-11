"use client";

import Link from "next/link";
import { useState } from "react";
export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  return (
    <main>
      <h1>Accede a Team Chat</h1>
      <p>El acceso estará disponible próximamente.</p>
      {!isRegister ? (
      <section aria-labelledby="login-title">
        <h2 id="login-title">Iniciar sesión</h2>
        <form>
          <p>
            <label htmlFor="login-email">Email</label>{" "}
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
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
          <button type="submit" disabled>
            Iniciar sesión
          </button>
        </form>
        <p>
          ¿No tienes cuenta?{" "}
          <button type="button" onClick={() => setIsRegister(true)}>Registrarse</button>
        </p>
      </section>
      ) : (
      <section aria-labelledby="register-title">
        <h2 id="register-title">Registrarse</h2>
        <form>
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
          <button type="submit" disabled>
            Crear cuenta
          </button>
        </form>
        <p>
          ¿Ya tienes cuenta?{" "}
          <button type="button" onClick={() => setIsRegister(false)}>Iniciar sesión</button>
        </p>
      </section>
      )}
      <p>
        <Link href="/">Volver al inicio</Link>
      </p>
    </main>
  );
}
